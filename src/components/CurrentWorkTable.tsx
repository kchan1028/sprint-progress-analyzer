import { useState } from 'react';
import type { Issue } from '../types/jira';
import { StatusBadge } from './StatusBadge';
import { formatShortDate } from '../utils/date';

export interface CurrentWorkRow {
  issue: Issue;
  daysInStatus: number;
  isBlocked: boolean;
  isAging: boolean;
  isStale: boolean;
  isUnestimated: boolean;
}

type Filter = 'all' | 'blocked' | 'aging' | 'stale' | 'unestimated';

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'aging', label: 'Aging' },
  { key: 'stale', label: 'Stale' },
  { key: 'unestimated', label: 'Unestimated' },
];

function matchesFilter(row: CurrentWorkRow, filter: Filter): boolean {
  switch (filter) {
    case 'blocked':
      return row.isBlocked;
    case 'aging':
      return row.isAging;
    case 'stale':
      return row.isStale;
    case 'unestimated':
      return row.isUnestimated;
    default:
      return true;
  }
}

/** Presentational aside from the filter toolbar: highlighting is driven entirely by flags computed upstream. */
export function CurrentWorkTable({ rows }: { rows: CurrentWorkRow[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  if (rows.length === 0) {
    return <div className="card signals-empty">No issues in this sprint.</div>;
  }

  const visible = rows.filter((row) => matchesFilter(row, filter));

  return (
    <div className="card">
      <div className="table-toolbar">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`filter-button ${filter === key ? 'filter-button--active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="signals-empty">No issues match this filter.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Summary</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Story Points</th>
              <th>Days In Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ issue, daysInStatus, isBlocked, isAging, isStale, isUnestimated }) => (
              <tr key={issue.id} className={isBlocked ? 'row--blocked' : isAging ? 'row--aging' : ''}>
                <td className="data-table__key">{issue.key}</td>
                <td>
                  {issue.summary}
                  {(isBlocked || isAging || isStale || isUnestimated) && (
                    <div className="row-flags">
                      {isBlocked && <span className="tag tag--blocked">Blocked</span>}
                      {isAging && <span className="tag tag--aging">Aging</span>}
                      {isStale && <span className="tag tag--stale">Stale</span>}
                      {isUnestimated && <span className="tag tag--unestimated">Unestimated</span>}
                    </div>
                  )}
                </td>
                <td>{issue.assignee?.displayName ?? <span className="muted">Unassigned</span>}</td>
                <td>
                  <StatusBadge status={issue.status} />
                </td>
                <td>{issue.storyPoints ?? <span className="muted">—</span>}</td>
                <td>{daysInStatus}</td>
                <td className="muted">{formatShortDate(issue.lastUpdatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
