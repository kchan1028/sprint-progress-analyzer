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
