/**
 * Minimum Jira data model needed for sprint progress analysis.
 *
 * This is deliberately modeled around *history*, not just current state.
 * Answering "are we on track" requires knowing when issues joined/left the
 * sprint and when their status changed - not just where they sit today.
 */

export type IssueStatus =
  | 'To Do'
  | 'In Progress'
  | 'Blocked'
  | 'In Review'
  | 'Done';

export interface Assignee {
  id: string;
  displayName: string;
}

/** One entry in an issue's status timeline. `exitedAt` is undefined for the current status. */
export interface StatusHistoryEntry {
  status: IssueStatus;
  enteredAt: string; // ISO date-time
  exitedAt?: string; // ISO date-time
}

/** A single sprint membership event - an issue being added to or removed from a sprint. */
export interface SprintChange {
  issueId: string;
  type: 'added' | 'removed';
  date: string; // ISO date-time
  storyPoints: number | null;
}

export interface Issue {
  id: string;
  key: string; // e.g. "JIRA-123"
  summary: string;
  assignee: Assignee | null;
  status: IssueStatus;
  /**
   * The original Jira status text (e.g. "Pull Request", "QA", "OBE") before
   * it was bucketed into `status`. Optional because demo data and older
   * imports don't have it. Used by workflowStages.ts for a finer-grained
   * delivery-pipeline view than the 5-bucket `status` supports on its own.
   */
  rawStatus?: string;
  storyPoints: number | null; // null = unestimated
  createdAt: string; // ISO date-time
  lastUpdatedAt: string; // ISO date-time

  /** When this issue joined the current sprint. */
  addedToSprintAt: string; // ISO date-time
  /** Set if the issue was later removed from the current sprint. */
  removedFromSprintAt?: string; // ISO date-time
  /** Whether the issue was already in the sprint when it started (vs. added later). */
  wasOriginalCommitment: boolean;

  /** Full status timeline, oldest first. Last entry has no `exitedAt`. */
  statusHistory: StatusHistoryEntry[];

  /** Optional free-text reason, populated when status is 'Blocked'. */
  blockedReason?: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  state: 'future' | 'active' | 'closed';
}
