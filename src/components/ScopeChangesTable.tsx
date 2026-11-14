import { useState } from 'react';
import type { ScopeChangeEntry } from '../utils/sprintCalculations';
import { formatShortDate } from '../utils/date';

type Filter = 'all' | 'added' | 'removed';

export function ScopeChangesTable({ changes, historyAvailable = true }: { changes: ScopeChangeEntry[]; historyAvailable?: boolean }) {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = changes.filter((change) => filter === 'all' || change.type === filter);

  if (!historyAvailable) {
    return <div className="card signals-empty">Scope history unavailable. A CSV snapshot cannot show which tickets were added or removed during the sprint.</div>;
  }

  return (
    <div className="card">
      <div className="table-toolbar">
        {(['all', 'added', 'removed'] as Filter[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={filter === option}
            className={`filter-button ${filter === option ? 'filter-button--active' : ''}`}
            onClick={() => setFilter(option)}
          >
            {option === 'all' ? 'All' : option === 'added' ? 'Added' : 'Removed'}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="signals-empty">No scope changes to show.</div>
      ) : (
        <div className="table-scroll" role="region" aria-label="Sprint scope changes table, scroll horizontally" tabIndex={0}>
        <table className="data-table" aria-label="Sprint scope changes">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Summary</th>
              <th>Story Points</th>
              <th>Change</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((change) => (
              <tr key={`${change.type}-${change.issue.id}`}>
                <td className="data-table__key">{change.issue.key}</td>
                <td>{change.issue.summary}</td>
                <td>{change.storyPoints ?? '—'}</td>
                <td>
                  <span className={`tag tag--${change.type}`}>
                    {change.type === 'added' ? 'Added' : 'Removed'}
                  </span>
                </td>
                <td className="muted">{formatShortDate(change.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
