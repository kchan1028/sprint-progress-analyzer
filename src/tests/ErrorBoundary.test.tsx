import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { csvJiraService } from '../services/jira';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

let shouldThrow = true;

function Flaky() {
  if (shouldThrow) throw new Error('bad imported value');
  return <p>Dashboard content</p>;
}

describe('ErrorBoundary', () => {
  it('shows a recovery screen and resets to demo data', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.spyOn(csvJiraService, 'resetToDemoData');
    shouldThrow = true;

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong showing this sprint');

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Reset to demo data' }));

    expect(reset).toHaveBeenCalledOnce();
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });
});
