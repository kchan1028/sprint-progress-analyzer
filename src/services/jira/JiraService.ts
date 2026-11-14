import type { Issue, Sprint, StatusHistoryEntry } from '../../types/jira';

/**
 * Abstraction over "wherever Jira data comes from".
 *
 * The dashboard only ever talks to this interface, never to mock data or
 * the Jira REST API directly. Swapping CsvJiraService for a real
 * JiraApiService (or a Jira plugin backend) should not require any changes
 * to components, hooks, or calculation logic.
 */
export interface JiraService {
  getCurrentSprint(): Promise<Sprint>;
  getSprintIssues(sprintId: string): Promise<Issue[]>;
  getIssueChangelog(issueId: string): Promise<StatusHistoryEntry[]>;
  /** Registers a listener to call whenever the underlying data changes (e.g. a new import). Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
}
