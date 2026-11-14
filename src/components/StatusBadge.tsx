import type { IssueStatus } from '../types/jira';

const STATUS_CLASS: Record<IssueStatus, string> = {
  'To Do': 'status-badge--todo',
  'In Progress': 'status-badge--in-progress',
  Blocked: 'status-badge--blocked',
  'In Review': 'status-badge--in-review',
  Done: 'status-badge--done',
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <span className={`status-badge ${STATUS_CLASS[status]}`}>{status}</span>;
}
