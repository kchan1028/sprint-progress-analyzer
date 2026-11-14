import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DashboardPage } from '../pages/DashboardPage';
import { csvJiraService } from '../services/jira';

afterEach(() => {
  cleanup();
  csvJiraService.resetToDemoData();
});

describe('dashboard data confidence', () => {
  it('labels synthetic history and retains demo scope metrics', async () => {
    render(<DashboardPage />);
    expect(await screen.findByRole('heading', { name: 'Fictional demo data' })).toBeInTheDocument();
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Days In Status' })).toBeInTheDocument();
  });

  it('distinguishes missing scope history from zero and labels estimates after import', async () => {
    csvJiraService.loadFromCsv(
      'Issue key,Summary,Status,Story Points,Updated\nEXAMPLE-1,Example task,In Progress,5,2026-01-01\nEXAMPLE-2,Example done,Done,3,2026-01-02',
      { name: 'Imported example', startDate: '2026-01-01', endDate: '2026-01-15' },
    );
    render(<DashboardPage />);
    expect(await screen.findByRole('heading', { name: 'CSV snapshot · limited history' })).toBeInTheDocument();
    for (const label of ['Original Commitment', 'Scope Added', 'Scope Removed']) {
      const card = screen.getByText(label).parentElement!;
      expect(within(card).getByText('Unavailable')).toBeInTheDocument();
      expect(within(card).queryByText('0')).not.toBeInTheDocument();
    }
    expect(screen.getByText('Current Scope').parentElement).toHaveTextContent('8');
    expect(screen.getByRole('columnheader', { name: 'Days In Status (estimated)' })).toBeInTheDocument();
    expect(screen.getByText('Completed (estimated dates)')).toBeInTheDocument();
    expect(screen.getByText(/Scope history unavailable/)).toBeInTheDocument();
    expect(screen.queryByText('No scope changes to show.')).not.toBeInTheDocument();
    expect(screen.getByText(/Estimated aging:/)).toBeInTheDocument();
  });
});
