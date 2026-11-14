import type { Issue, IssueStatus, Sprint, StatusHistoryEntry } from '../../types/jira';
import { mockIssues, mockSprint } from '../../data/mockData';
import { parseJiraCsv, type ImportSprintMeta } from '../../utils/parseJiraCsv';
import type { JiraService } from './JiraService';

/** Simulates realistic network latency so loading states are exercised. */
function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * JiraService backed by an in-memory sprint that starts out as the demo
 * mock data and can be replaced at runtime via `loadFromCsv`, e.g. from a
 * file the user uploads in the browser. Subscribers (see `useSprintData`)
 * are notified so the dashboard re-renders with the newly imported data.
 */
export class CsvJiraService implements JiraService {
  private sprint: Sprint = mockSprint;
  private issues: Issue[] = mockIssues;
  private listeners = new Set<() => void>();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Parses `csvText` (a Jira issue-navigator CSV export) and replaces the
   * current sprint. `customStatusMap` maps raw Jira status names to this
   * app's IssueStatus, for workflows using status names outside the
   * built-in defaults (see `unknownStatuses` in the result).
   */
  loadFromCsv(
    csvText: string,
    sprintMeta: ImportSprintMeta,
    customStatusMap?: Record<string, IssueStatus>,
  ): { warnings: string[]; unknownStatuses: string[] } {
    const { issues, warnings, unknownStatuses } = parseJiraCsv(csvText, sprintMeta, customStatusMap);

    if (issues.length > 0) {
      this.sprint = {
        id: `imported-${Date.now()}`,
        name: sprintMeta.name,
        goal: sprintMeta.goal,
        startDate: sprintMeta.startDate,
        endDate: sprintMeta.endDate,
        state: 'active',
      };
      this.issues = issues;
      this.listeners.forEach((listener) => listener());
    }

    return { warnings, unknownStatuses };
  }

  resetToDemoData(): void {
    this.sprint = mockSprint;
    this.issues = mockIssues;
    this.listeners.forEach((listener) => listener());
  }

  async getCurrentSprint(): Promise<Sprint> {
    return delay(this.sprint);
  }

  async getSprintIssues(sprintId: string): Promise<Issue[]> {
    if (sprintId !== this.sprint.id) {
      return delay([]);
    }
    return delay(this.issues);
  }

  async getIssueChangelog(issueId: string): Promise<StatusHistoryEntry[]> {
    const issue = this.issues.find((candidate) => candidate.id === issueId);
    return delay(issue ? issue.statusHistory : []);
  }
}
