import type { Sprint } from '../types/jira';
import type { OverallSprintStatus } from '../utils/sprintCalculations';
import { formatShortDate } from '../utils/date';

interface SprintHeaderProps {
  sprint: Sprint;
  status: OverallSprintStatus;
  daysElapsed: number;
  daysRemaining: number;
}

const STATUS_ICON: Record<OverallSprintStatus['level'], string> = {
  'on-track': '✓',
  'at-risk': '⚠',
  behind: '⛔',
};

export function SprintHeader({ sprint, status, daysElapsed, daysRemaining }: SprintHeaderProps) {
  return (
    <div className="card sprint-header">
      <div className="sprint-header__identity">
        <div className="sprint-header__top-row">
          <h1 className="sprint-header__name">{sprint.name}</h1>
          <span className={`status-pill status-pill--${status.level}`}>
            <span className="status-pill__icon" aria-hidden="true">
              {STATUS_ICON[status.level]}
            </span>
            {status.label}
          </span>
        </div>
        {sprint.goal && <div className="sprint-header__goal">{sprint.goal}</div>}
      </div>
      <div className="sprint-header__stats">
        <div className="stat">
          <div className="stat__label">Start</div>
          <div className="stat__value">{formatShortDate(sprint.startDate)}</div>
        </div>
        <div className="stat">
          <div className="stat__label">End</div>
          <div className="stat__value">{formatShortDate(sprint.endDate)}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Days Elapsed</div>
          <div className="stat__value">{daysElapsed}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Days Remaining</div>
          <div className="stat__value">{daysRemaining}</div>
        </div>
      </div>
    </div>
  );
}
