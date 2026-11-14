import type { Assignee, Issue, IssueStatus, Sprint, StatusHistoryEntry } from '../types/jira';
import { addDays } from '../utils/date';

/**
 * Anchor point for all mock dates. Using "now" (rather than fixed calendar
 * dates) means the demo always shows a sprint that is realistically in
 * progress, no matter when it's opened.
 */
const NOW = new Date();

/** ISO string N days from NOW. Negative = in the past. */
function offset(days: number): string {
  return addDays(NOW, days).toISOString();
}

/**
 * Builds a status history from a list of [status, daysOffsetFromNow] tuples,
 * oldest first. Each entry's `exitedAt` is derived from the next entry's
 * `enteredAt`; the last entry is the current status and has no `exitedAt`.
 */
function history(steps: Array<[IssueStatus, number]>): StatusHistoryEntry[] {
  return steps.map(([status, days], index) => {
    const entry: StatusHistoryEntry = { status, enteredAt: offset(days) };
    const next = steps[index + 1];
    if (next) entry.exitedAt = offset(next[1]);
    return entry;
  });
}

const ASSIGNEES: Record<string, Assignee> = {
  alice: { id: 'u1', displayName: 'Alice Chen' },
  bob: { id: 'u2', displayName: 'Bob Martinez' },
  carla: { id: 'u3', displayName: 'Carla Singh' },
  dev: { id: 'u4', displayName: 'Dev Patel' },
  elena: { id: 'u5', displayName: 'Elena Rossi' },
  frank: { id: 'u6', displayName: 'Frank Osei' },
};

export const SPRINT_START_OFFSET = -9;
export const SPRINT_END_OFFSET = 4;

export const mockSprint: Sprint = {
  id: 'sprint-42',
  name: 'Sprint 42',
  goal: 'Ship billing reliability improvements and reduce auth support tickets.',
  startDate: offset(SPRINT_START_OFFSET),
  endDate: offset(SPRINT_END_OFFSET),
  state: 'active',
  source: 'demo',
};

export const mockIssues: Issue[] = [
  // --- Done (original commitment): 53 SP total ---
  {
    id: '101', key: 'JIRA-101', summary: 'Implement OAuth token refresh', assignee: ASSIGNEES.alice,
    status: 'Done', storyPoints: 8, createdAt: offset(-14), lastUpdatedAt: offset(-6),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -8], ['Done', -6]]),
  },
  {
    id: '102', key: 'JIRA-102', summary: 'Fix pagination bug in search results', assignee: ASSIGNEES.bob,
    status: 'Done', storyPoints: 5, createdAt: offset(-12), lastUpdatedAt: offset(-5),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -7], ['Done', -5]]),
  },
  {
    id: '103', key: 'JIRA-103', summary: 'Add rate limiting middleware', assignee: ASSIGNEES.carla,
    status: 'Done', storyPoints: 8, createdAt: offset(-15), lastUpdatedAt: offset(-7),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -9], ['Done', -7]]),
  },
  {
    id: '105', key: 'JIRA-105', summary: 'Migrate user settings to new schema', assignee: ASSIGNEES.dev,
    status: 'Done', storyPoints: 5, createdAt: offset(-10), lastUpdatedAt: offset(-4),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -8], ['Done', -4]]),
  },
  {
    id: '106', key: 'JIRA-106', summary: 'Add unit tests for billing service', assignee: ASSIGNEES.elena,
    status: 'Done', storyPoints: 3, createdAt: offset(-9), lastUpdatedAt: offset(-3),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -6], ['Done', -3]]),
  },
  {
    id: '107', key: 'JIRA-107', summary: 'Update onboarding email templates', assignee: ASSIGNEES.frank,
    status: 'Done', storyPoints: 2, createdAt: offset(-11), lastUpdatedAt: offset(-2),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -5], ['Done', -2]]),
  },
  {
    id: '108', key: 'JIRA-108', summary: 'Refactor auth middleware for readability', assignee: ASSIGNEES.alice,
    status: 'Done', storyPoints: 5, createdAt: offset(-13), lastUpdatedAt: offset(-5),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -8], ['Done', -5]]),
  },
  {
    id: '110', key: 'JIRA-110', summary: 'Add caching layer for product catalog', assignee: ASSIGNEES.bob,
    status: 'Done', storyPoints: 8, createdAt: offset(-16), lastUpdatedAt: offset(-3),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -9], ['Done', -3]]),
  },
  {
    id: '111', key: 'JIRA-111', summary: 'Fix flaky integration test suite', assignee: ASSIGNEES.carla,
    status: 'Done', storyPoints: 3, createdAt: offset(-10), lastUpdatedAt: offset(-6),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -8], ['Done', -6]]),
  },
  {
    id: '112', key: 'JIRA-112', summary: 'Add export-to-CSV for reports', assignee: ASSIGNEES.dev,
    status: 'Done', storyPoints: 3, createdAt: offset(-9), lastUpdatedAt: offset(-2),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -4], ['Done', -2]]),
  },
  {
    id: '113', key: 'JIRA-113', summary: 'Improve error messages for failed payments', assignee: ASSIGNEES.elena,
    status: 'Done', storyPoints: 3, createdAt: offset(-9), lastUpdatedAt: offset(-1),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -3], ['Done', -1]]),
  },

  // --- Removed from sprint ---
  {
    id: '104', key: 'JIRA-104', summary: 'Old customer dashboard workflow cleanup', assignee: ASSIGNEES.bob,
    status: 'To Do', storyPoints: 3, createdAt: offset(-20), lastUpdatedAt: offset(-6),
    addedToSprintAt: offset(SPRINT_START_OFFSET), removedFromSprintAt: offset(-6), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9]]),
  },

  // --- Original commitment, still in flight ---
  {
    id: '114', key: 'JIRA-114', summary: 'Build notification preferences UI', assignee: ASSIGNEES.frank,
    status: 'In Progress', storyPoints: 5, createdAt: offset(-9), lastUpdatedAt: offset(-1),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -5]]),
  },
  {
    id: '115', key: 'JIRA-115', summary: 'Investigate memory leak in worker process', assignee: ASSIGNEES.alice,
    status: 'Blocked', storyPoints: 8, createdAt: offset(-9), lastUpdatedAt: offset(-2),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    blockedReason: 'Waiting on infra team to provision profiling access',
    statusHistory: history([['To Do', -9], ['In Progress', -7], ['Blocked', -2]]),
  },
  {
    id: '116', key: 'JIRA-116', summary: 'Add SSO login support', assignee: ASSIGNEES.bob,
    status: 'Blocked', storyPoints: 3, createdAt: offset(-9), lastUpdatedAt: offset(-4),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    blockedReason: 'Waiting on third-party SSO vendor documentation',
    statusHistory: history([['To Do', -9], ['In Progress', -6], ['Blocked', -4]]),
  },
  {
    id: '117', key: 'JIRA-117', summary: 'Write API docs for public endpoints', assignee: ASSIGNEES.carla,
    status: 'To Do', rawStatus: 'Ready', storyPoints: 2, createdAt: offset(-9), lastUpdatedAt: offset(-9),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9]]),
  },
  {
    id: '118', key: 'JIRA-118', summary: 'Add dark mode toggle', assignee: ASSIGNEES.dev,
    status: 'In Review', rawStatus: 'QA', storyPoints: 3, createdAt: offset(-9), lastUpdatedAt: offset(-1),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -6], ['In Review', -1]]),
  },
  {
    id: '119', key: 'JIRA-119', summary: 'Cleanup deprecated feature flags', assignee: null,
    status: 'To Do', rawStatus: 'Created', storyPoints: 3, createdAt: offset(-8), lastUpdatedAt: offset(-8),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9]]),
  },

  // --- Added after sprint start ---
  {
    id: '120', key: 'JIRA-120', summary: 'Add profile validation for signup form', assignee: ASSIGNEES.elena,
    status: 'In Progress', storyPoints: 5, createdAt: offset(-6), lastUpdatedAt: offset(-1),
    addedToSprintAt: offset(-6), wasOriginalCommitment: false,
    statusHistory: history([['To Do', -6], ['In Progress', -5]]),
  },
  {
    id: '121', key: 'JIRA-121', summary: 'Fix API response shape for /invoices', assignee: ASSIGNEES.frank,
    status: 'To Do', storyPoints: 8, createdAt: offset(-4), lastUpdatedAt: offset(-4),
    addedToSprintAt: offset(-4), wasOriginalCommitment: false,
    statusHistory: history([['To Do', -4]]),
  },
  {
    id: '122', key: 'JIRA-122', summary: 'Hotfix: incorrect tax calculation', assignee: ASSIGNEES.alice,
    status: 'In Progress', storyPoints: 4, createdAt: offset(-2), lastUpdatedAt: offset(-1),
    addedToSprintAt: offset(-2), wasOriginalCommitment: false,
    statusHistory: history([['To Do', -2], ['In Progress', -2]]),
  },

  // --- Unestimated ---
  {
    id: '123', key: 'JIRA-123', summary: 'Spike: evaluate GraphQL gateway options', assignee: ASSIGNEES.carla,
    status: 'In Progress', rawStatus: 'Pull Request', storyPoints: null, createdAt: offset(-9), lastUpdatedAt: offset(-7),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -7]]),
  },
  {
    id: '124', key: 'JIRA-124', summary: 'Research: new CI provider evaluation', assignee: null,
    status: 'To Do', rawStatus: 'Sprint Planning', storyPoints: null, createdAt: offset(-1), lastUpdatedAt: offset(-1),
    addedToSprintAt: offset(-1), wasOriginalCommitment: false,
    statusHistory: history([['To Do', -1]]),
  },
  {
    id: '125', key: 'JIRA-125', summary: 'Add retry logic for webhook delivery', assignee: ASSIGNEES.dev,
    status: 'In Progress', rawStatus: 'Peer Review', storyPoints: null, createdAt: offset(-9), lastUpdatedAt: offset(-1),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -6]]),
  },
  {
    id: '126', key: 'JIRA-126', summary: 'Update dependency: bump React to v18', assignee: ASSIGNEES.frank,
    status: 'Done', rawStatus: 'Released', storyPoints: null, createdAt: offset(-9), lastUpdatedAt: offset(-3),
    addedToSprintAt: offset(SPRINT_START_OFFSET), wasOriginalCommitment: true,
    statusHistory: history([['To Do', -9], ['In Progress', -8], ['Done', -3]]),
  },
  {
    id: '127', key: 'JIRA-127', summary: 'Triage: sporadic 500 errors on checkout', assignee: ASSIGNEES.alice,
    status: 'To Do', rawStatus: 'PM & Design Review', storyPoints: null, createdAt: offset(-7), lastUpdatedAt: offset(-7),
    addedToSprintAt: offset(-7), wasOriginalCommitment: false,
    statusHistory: history([['To Do', -7]]),
  },
];
