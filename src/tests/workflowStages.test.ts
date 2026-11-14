import { describe, expect, it } from 'vitest';
import type { Issue } from '../types/jira';
import { getWorkflowPipeline, getWorkflowStage, WORKFLOW_STAGES } from '../utils/workflowStages';

function makeIssue(overrides: Partial<Issue> & Pick<Issue, 'id' | 'key'>): Issue {
  return {
    summary: 'Test issue',
    assignee: null,
    status: 'To Do',
    storyPoints: 5,
    createdAt: '2026-09-06T09:00:00.000Z',
    lastUpdatedAt: '2026-09-07T09:00:00.000Z',
    addedToSprintAt: '2026-09-07T09:00:00.000Z',
    wasOriginalCommitment: true,
    statusHistory: [{ status: 'To Do', enteredAt: '2026-09-07T09:00:00.000Z' }],
    ...overrides,
  };
}

describe('getWorkflowStage', () => {
  it('maps raw Jira status text to the finer-grained pipeline stage', () => {
    const cases: Array<[string, ReturnType<typeof getWorkflowStage>]> = [
      ['To Do', 'Not Started'],
      ['Open', 'Not Started'],
      ['Ready', 'Not Started'],
      ['Created', 'Not Started'],
      ['Sprint Planning', 'Not Started'],
      ['Dev Rereview', 'Not Started'],
      ['PM & Design Review', 'Not Started'],
      ['In Progress', 'In Development'],
      ['Development', 'In Development'],
      ['Pull Request', 'Code Review'],
      ['Code Review', 'Code Review'],
      ['Peer Review', 'Code Review'],
      ['Ready for QA', 'Testing'],
      ['QA', 'Testing'],
      ['Testing', 'Testing'],
      ['UAT', 'Testing'],
      ['Alpha Deployed', 'Testing'],
      ['Blocked', 'Blocked'],
      ['Done', 'Done'],
      ['Closed', 'Done'],
      ['Resolved', 'Done'],
      ['Released', 'Done'],
      ['OBE', 'Deleted'],
    ];

    for (const [rawStatus, expected] of cases) {
      const issue = makeIssue({ id: rawStatus, key: rawStatus, rawStatus, status: 'To Do' });
      expect(getWorkflowStage(issue)).toBe(expected);
    }
  });

  it('is case-insensitive on the raw status text', () => {
    const issue = makeIssue({ id: '1', key: 'A-1', rawStatus: 'pull request', status: 'To Do' });
    expect(getWorkflowStage(issue)).toBe('Code Review');
  });

  it('falls back to a stage derived from the 5-bucket status when rawStatus is absent', () => {
    expect(getWorkflowStage(makeIssue({ id: '1', key: 'A-1', status: 'To Do' }))).toBe('Not Started');
    expect(getWorkflowStage(makeIssue({ id: '2', key: 'A-2', status: 'In Progress' }))).toBe('In Development');
    expect(getWorkflowStage(makeIssue({ id: '3', key: 'A-3', status: 'In Review' }))).toBe('Code Review');
    expect(getWorkflowStage(makeIssue({ id: '4', key: 'A-4', status: 'Blocked' }))).toBe('Blocked');
    expect(getWorkflowStage(makeIssue({ id: '5', key: 'A-5', status: 'Done' }))).toBe('Done');
  });

  it('falls back when rawStatus is set but unrecognized', () => {
    const issue = makeIssue({ id: '1', key: 'A-1', rawStatus: 'Some Custom Status', status: 'In Progress' });
    expect(getWorkflowStage(issue)).toBe('In Development');
  });
});

describe('getWorkflowPipeline', () => {
  it('returns one summary per WORKFLOW_STAGES, in order, even when a stage is empty', () => {
    const summaries = getWorkflowPipeline([]);
    expect(summaries.map((s) => s.stage)).toEqual(WORKFLOW_STAGES);
    for (const summary of summaries) {
      expect(summary.issues).toEqual([]);
      expect(summary.storyPoints).toBe(0);
    }
  });

  it('groups issues into their stage and sums story points, treating unestimated as 0', () => {
    const issues = [
      makeIssue({ id: '1', key: 'A-1', rawStatus: 'QA', storyPoints: 5 }),
      makeIssue({ id: '2', key: 'A-2', rawStatus: 'Testing', storyPoints: 3 }),
      makeIssue({ id: '3', key: 'A-3', rawStatus: 'QA', storyPoints: null }),
    ];
    const summaries = getWorkflowPipeline(issues);
    const testing = summaries.find((s) => s.stage === 'Testing')!;
    expect(testing.issues.map((i) => i.key)).toEqual(['A-1', 'A-2', 'A-3']);
    expect(testing.storyPoints).toBe(8);
  });

  it('excludes issues removed from the sprint', () => {
    const removed = makeIssue({ id: '1', key: 'A-1', rawStatus: 'QA', removedFromSprintAt: '2026-09-10T00:00:00.000Z' });
    const summaries = getWorkflowPipeline([removed]);
    expect(summaries.every((s) => s.issues.length === 0)).toBe(true);
  });
});
