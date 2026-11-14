import type { Sprint } from '../types/jira';
import type { CompletionEvent, ScopeChangeEntry } from '../utils/sprintCalculations';
import { formatShortDate } from '../utils/date';

interface SprintTimelineProps {
  sprint: Sprint;
  now: Date;
  originalCommitment: number;
  currentScope: number;
  completedPoints: number;
  scopeChanges: ScopeChangeEntry[];
  completionEvents: CompletionEvent[];
}

function percentOf(date: string | Date, sprint: Sprint): number {
  const start = new Date(sprint.startDate).getTime();
  const end = new Date(sprint.endDate).getTime();
  const target = new Date(date).getTime();
  if (end === start) return 0;
  const pct = ((target - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function SprintTimeline({
  sprint,
  now,
  originalCommitment,
  currentScope,
  completedPoints,
  scopeChanges,
  completionEvents,
}: SprintTimelineProps) {
  const todayPct = percentOf(now, sprint);

  return (
    <div className="card timeline">
      <div className="timeline__track">
        <div className="timeline__progress" style={{ width: `${todayPct}%` }} />

        <div className="timeline__label" style={{ left: '0%' }}>
          <div className="timeline__label-title">START</div>
          <div className="timeline__label-date">{formatShortDate(sprint.startDate)}</div>
        </div>
        <div className="timeline__label" style={{ left: `${todayPct}%` }}>
          <div className="timeline__label-title">TODAY</div>
          <div className="timeline__label-date">{formatShortDate(now)}</div>
        </div>
        <div className="timeline__label" style={{ left: '100%' }}>
          <div className="timeline__label-title">END</div>
          <div className="timeline__label-date">{formatShortDate(sprint.endDate)}</div>
        </div>

        <div className="timeline__marker" style={{ left: '0%' }} />
        <div className="timeline__marker timeline__marker--today" style={{ left: `${todayPct}%` }} />
        <div className="timeline__marker" style={{ left: '100%' }} />

        {scopeChanges.map((change) => (
          <div
            key={`${change.type}-${change.issue.id}`}
            className={`timeline__event timeline__event--${change.type}`}
            style={{ left: `${percentOf(change.date, sprint)}%` }}
            title={`${change.issue.key} ${change.type} ${formatShortDate(change.date)}`}
          />
        ))}
        {completionEvents.map((event) => (
          <div
            key={`done-${event.issue.id}`}
            className="timeline__event timeline__event--completed"
            style={{ left: `${percentOf(event.date, sprint)}%` }}
            title={`${event.issue.key} completed ${formatShortDate(event.date)}`}
          />
        ))}
      </div>

      <div className="timeline__legend">
        <span className="timeline__legend-item">
          <span className="timeline__legend-dot" style={{ background: 'var(--color-warning)' }} />
          Added
        </span>
        <span className="timeline__legend-item">
          <span className="timeline__legend-dot" style={{ background: 'var(--color-danger)' }} />
          Removed
        </span>
        <span className="timeline__legend-item">
          <span className="timeline__legend-dot" style={{ background: 'var(--color-success)' }} />
          Completed
        </span>
      </div>

      <div className="timeline__summary">
        <div className="stat" style={{ textAlign: 'left' }}>
          <div className="stat__label">Original</div>
          <div className="stat__value">{originalCommitment} SP</div>
        </div>
        <div className="stat" style={{ textAlign: 'left' }}>
          <div className="stat__label">Current</div>
          <div className="stat__value">{currentScope} SP</div>
        </div>
        <div className="stat" style={{ textAlign: 'left' }}>
          <div className="stat__label">Completed</div>
          <div className="stat__value">{completedPoints} SP</div>
        </div>
      </div>
    </div>
  );
}
