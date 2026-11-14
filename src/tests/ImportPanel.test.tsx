import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ImportPanel } from '../components/ImportPanel';

afterEach(cleanup);

describe('CSV import feedback', () => {
  it.each([
    ['', 'CSV file is empty.'],
    ['Summary,Status\nExample,Done', 'Could not find an "Issue key" column'],
  ])('reports invalid CSV as an error', async (csv, warning) => {
    render(<ImportPanel defaultOpen />);
    const file = new File([csv], 'invalid.csv', { type: 'text/csv' });
    Object.defineProperty(file, 'text', { value: async () => csv });
    fireEvent.change(screen.getByLabelText('CSV file'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Import "invalid.csv"' }));
    expect(await screen.findByText('No issues imported. Check the CSV notes below.')).toBeInTheDocument();
    expect(screen.getByText(warning, { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(/Imported successfully/)).not.toBeInTheDocument();
  });

  it('rejects an empty sprint start date without throwing', async () => {
    render(<ImportPanel defaultOpen />);
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '' } });
    const file = new File(['Issue key\nDEMO-1'], 'example.csv');
    Object.defineProperty(file, 'text', { value: async () => 'Issue key\nDEMO-1' });
    fireEvent.change(screen.getByLabelText('CSV file'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Import "example.csv"' }));
    expect(await screen.findByText('Sprint end date must be after the start date.')).toBeInTheDocument();
  });
});

describe('large import warning', () => {
  function chooseFile(csv: string) {
    const file = new File([csv], 'big.csv', { type: 'text/csv' });
    Object.defineProperty(file, 'text', { value: async () => csv });
    fireEvent.change(screen.getByLabelText('CSV file'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Import "big.csv"' }));
  }

  const bigCsv = 'Issue key,Status\n' + Array.from({ length: 1001 }, (_, i) => `BIG-${i},Done`).join('\n');

  it('asks before importing more than the row threshold, and imports on confirm', async () => {
    render(<ImportPanel defaultOpen />);
    chooseFile(bigCsv);
    expect(await screen.findByText(/This file has 1,001 rows/)).toBeInTheDocument();
    expect(screen.queryByText(/Imported successfully/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Import anyway' }));
    expect(await screen.findByText(/Imported successfully/)).toBeInTheDocument();
    expect(screen.queryByText(/This file has 1,001 rows/)).not.toBeInTheDocument();
  });

  it('does not import when cancelled', async () => {
    render(<ImportPanel defaultOpen />);
    chooseFile(bigCsv);
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText(/This file has/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Imported successfully/)).not.toBeInTheDocument();
  });

  it('imports a file at the threshold without asking', async () => {
    render(<ImportPanel defaultOpen />);
    chooseFile('Issue key,Status\n' + Array.from({ length: 1000 }, (_, i) => `OK-${i},Done`).join('\n'));
    expect(await screen.findByText(/Imported successfully/)).toBeInTheDocument();
  });
});
