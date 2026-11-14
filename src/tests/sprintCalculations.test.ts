import { describe, expect, it } from 'vitest';
import type { Issue, Sprint } from '../types/jira';
import {
  getAgingInProgressIssues,
  getBlockedIssues,
  getCommitmentProgress,
  getCompletedPoints,
  getCurrentScope,
  getCurrentScopeProgress,
  getDaysElapsed,
  getDaysInCurrentStatus,
  getDaysRemaining,
  getOriginalCommitment,
  getOverallSprintStatus,
  getRemainingPoints,
  getScopeAdded,
  getScopeChangePercent,
  getScopeChanges,
  getScopeRemoved,
  getSprintSignals,
  getStaleIssues,
  getUnestimatedIssues,
  isCurrentlyInSprint,
} from '../utils/sprintCalculations';

const SPRINT: Sprint = {
  id: 'sprint-1',
  name: 'Sprint 1',
  startDate: '2026-09-07T09:00:00.000Z',
  endDate: '2026-09-20T17:00:00.000Z',
  state: 'active',
  source: 'demo',
};

const NOW = new Date('2026-09-16T12:00:00.000Z');

function makeIssue(overrides: Partial<Issue> & Pick<Issue, 'id' | 'key'>): Issue {
  return {
    summary: 'Test issue',
    assignee: null,
    status: 'To Do',
    storyPoints: 5,
    createdAt: '2026-09-06T09:00:00.000Z',
    lastUpdatedAt: '2026-09-07T09:00:00.000Z',
    addedToSprintAt: SPRINT.startDate,
    wasOriginalCommitment: true,
    statusHistory: [{ status: 'To Do', enteredAt: SPRINT.startDate }],
    ...overrides,
  };
}

// Mirrors the worked example from the product spec:
// Original Commitment 80, Current Scope 94, Completed 53 -> 66% / 56% / +17.5%
const originalDone: Issue[] = [
  makeIssue({ id: '1', key: 'A-1', storyPoints: 30, status: 'Done', wasOriginalCommitment: true }),
  makeIssue({ id: '2', key: 'A-2', storyPoints: 23, status: 'Done', wasOriginalCommitment: true }),
];
const originalRemaining = makeIssue({
  id: '3',
  key: 'A-3',
  storyPoints: 27,
  status: 'In Progress',
  wasOriginalCommitment: true,
});
const addedIssue = makeIssue({
  id: '4',
  key: 'A-4',
  storyPoints: 14,
  status: 'To Do',
  wasOriginalCommitment: false,
  addedToSprintAt: '2026-09-10T09:00:00.000Z',
});

const workedExampleIssues: Issue[] = [...originalDone, originalRemaining, addedIssue];

describe('scope calculations (worked example: 80 / 94 / 53)', () => {
  it('computes original commitment from issues present at sprint start', () => {
    expect(getOriginalCommitment(workedExampleIssues)).toBe(80);
  });

  it('computes current scope as everything not removed', () => {
    expect(getCurrentScope(workedExampleIssues)).toBe(94);
  });

  it('computes completed points from currently-in-sprint Done issues', () => {
    expect(getCompletedPoints(workedExampleIssues)).toBe(53);
  });

  it('computes remaining points as scope minus completed', () => {
    expect(getRemainingPoints(workedExampleIssues)).toBe(41);
  });

  it('computes commitment progress as completed / original commitment', () => {
    expect(getCommitmentProgress(workedExampleIssues)).toBeCloseTo(53 / 80, 5);
    expect(Math.round((getCommitmentProgress(workedExampleIssues) ?? 0) * 100)).toBe(66);
  });

  it('computes current scope progress as completed / current scope', () => {
    expect(getCurrentScopeProgress(workedExampleIssues)).toBeCloseTo(53 / 94, 5);
    expect(Math.round((getCurrentScopeProgress(workedExampleIssues) ?? 0) * 100)).toBe(56);
  });

  it('computes scope change as (current - original) / original', () => {
    expect(getScopeChangePercent(workedExampleIssues)).toBeCloseTo(0.175, 5);
  });

  it('returns null for progress metrics when there is no original commitment', () => {
    expect(getCommitmentProgress([])).toBeNull();
    expect(getScopeChangePercent([])).toBeNull();
  });
});

describe('scope added / removed', () => {
  it('counts points added after sprint start, excluding original commitment', () => {
    expect(getScopeAdded(workedExampleIssues, SPRINT)).toBe(14);
  });

  it('does not count original-commitment issues as scope added', () => {
    expect(getScopeAdded(originalDone, SPRINT)).toBe(0);
  });

  it('still counts scope added for an issue that was later removed', () => {
    const addedThenRemoved = makeIssue({
      id: '5',
      key: 'A-5',
      storyPoints: 9,
      wasOriginalCommitment: false,
      addedToSprintAt: '2026-09-11T09:00:00.000Z',
      removedFromSprintAt: '2026-09-13T09:00:00.000Z',
    });
    expect(getScopeAdded([addedThenRemoved], SPRINT)).toBe(9);
    expect(getScopeRemoved([addedThenRemoved])).toBe(9);
    // A removed issue is no longer part of current scope even though it was "added".
    expect(getCurrentScope([addedThenRemoved])).toBe(0);
  });

  it('excludes removed issues from current scope but still counts them as removed', () => {
    const removed = makeIssue({
      id: '6',
      key: 'A-6',
      storyPoints: 12,
      wasOriginalCommitment: true,
      removedFromSprintAt: '2026-09-12T09:00:00.000Z',
    });
    expect(isCurrentlyInSprint(removed)).toBe(false);
    expect(getScopeRemoved([removed])).toBe(12);
    expect(getOriginalCommitment([removed])).toBe(12);
    expect(getCurrentScope([removed])).toBe(0);
  });

  it('treats unestimated issues as contributing 0 points to every total', () => {
    const unestimated = makeIssue({ id: '7', key: 'A-7', storyPoints: null });
    expect(getOriginalCommitment([unestimated])).toBe(0);
    expect(getCurrentScope([unestimated])).toBe(0);
    expect(getScopeAdded([unestimated], SPRINT)).toBe(0);
  });
});

describe('getScopeChanges', () => {
  it('produces one entry per added issue and one per removed issue, newest first', () => {
    const removed = makeIssue({
      id: '8',
      key: 'A-8',
      storyPoints: 3,
      wasOriginalCommitment: true,
      removedFromSprintAt: '2026-09-13T09:00:00.000Z',
    });
    const changes = getScopeChanges([...workedExampleIssues, removed], SPRINT);

    expect(changes).toHaveLength(2);
    expect(changes.map((c) => c.type)).toEqual(['removed', 'added']);
    expect(changes[0].issue.key).toBe('A-8');
    expect(changes[1].issue.key).toBe('A-4');
  });
});

describe('days remaining / elapsed', () => {
  it('computes days elapsed from sprint start to now', () => {
    expect(getDaysElapsed(SPRINT, NOW)).toBe(9);
  });

  it('computes days remaining from now to sprint end', () => {
    expect(getDaysRemaining(SPRINT, NOW)).toBe(4);
  });

  it('never returns negative days remaining once the sprint has ended', () => {
    const pastEnd = new Date('2026-09-25T09:00:00.000Z');
    expect(getDaysRemaining(SPRINT, pastEnd)).toBe(0);
  });
});

describe('status-based signals', () => {
  it('flags blocked issues', () => {
    const blocked = makeIssue({ id: '9', key: 'A-9', status: 'Blocked' });
    const notBlocked = makeIssue({ id: '10', key: 'A-10', status: 'In Progress' });
    expect(getBlockedIssues([blocked, notBlocked])).toEqual([blocked]);
  });

  it('computes days in current status from the last status-history entry', () => {
    const issue = makeIssue({
      id: '11',
      key: 'A-11',
      status: 'In Progress',
      statusHistory: [
        { status: 'To Do', enteredAt: '2026-09-07T09:00:00.000Z', exitedAt: '2026-09-10T09:00:00.000Z' },
        { status: 'In Progress', enteredAt: '2026-09-10T09:00:00.000Z' },
      ],
    });
    expect(getDaysInCurrentStatus(issue, NOW)).toBe(6);
  });

  it('flags In Progress issues aging past the threshold', () => {
    const aging = makeIssue({
      id: '12',
      key: 'A-12',
      status: 'In Progress',
      statusHistory: [{ status: 'In Progress', enteredAt: '2026-09-10T09:00:00.000Z' }],
    });
    const fresh = makeIssue({
      id: '13',
      key: 'A-13',
      status: 'In Progress',
      statusHistory: [{ status: 'In Progress', enteredAt: '2026-09-15T09:00:00.000Z' }],
    });
    const result = getAgingInProgressIssues([aging, fresh], NOW, 4);
    expect(result).toEqual([aging]);
  });

  it('flags issues with no activity for the stale threshold, excluding Done', () => {
    const stale = makeIssue({ id: '14', key: 'A-14', status: 'To Do', lastUpdatedAt: '2026-09-10T09:00:00.000Z' });
    const staleButDone = makeIssue({
      id: '15',
      key: 'A-15',
      status: 'Done',
      lastUpdatedAt: '2026-09-10T09:00:00.000Z',
    });
    const fresh = makeIssue({ id: '16', key: 'A-16', status: 'To Do', lastUpdatedAt: '2026-09-15T09:00:00.000Z' });
    const result = getStaleIssues([stale, staleButDone, fresh], NOW, 3);
    expect(result).toEqual([stale]);
  });

  it('flags unestimated issues currently in the sprint', () => {
    const unestimated = makeIssue({ id: '17', key: 'A-17', storyPoints: null });
    const removedUnestimated = makeIssue({
      id: '18',
      key: 'A-18',
      storyPoints: null,
      removedFromSprintAt: '2026-09-10T09:00:00.000Z',
    });
    expect(getUnestimatedIssues([unestimated, removedUnestimated])).toEqual([unestimated]);
  });
});

describe('getSprintSignals', () => {
  it('reports factual signals without producing any single combined score', () => {
    const signals = getSprintSignals(SPRINT, workedExampleIssues, NOW);
    const ids = signals.map((s) => s.id);

    expect(ids).toContain('scope-added-points');
    expect(ids).toContain('scope-added-issues');
    expect(ids).toContain('remaining-points');
    expect(signals.find((s) => s.id === 'scope-added-points')?.message).toBe('14 SP added after sprint started');
    expect(signals).not.toContainEqual(expect.objectContaining({ id: 'sprint-health-score' }));
  });

  it('omits signals whose underlying count is zero', () => {
    const signals = getSprintSignals(SPRINT, originalDone, NOW);
    expect(signals.find((s) => s.id === 'blocked-issues')).toBeUndefined();
    expect(signals.find((s) => s.id === 'scope-added-points')).toBeUndefined();
  });

  it('attaches plain-English explanation, why-it-matters, threshold legend, and watch-for copy to every signal', () => {
    const signals = getSprintSignals(SPRINT, workedExampleIssues, NOW);
    for (const signal of signals) {
      expect(signal.explanation).toBeTruthy();
      expect(signal.whyItMatters).toBeTruthy();
      expect(signal.thresholdLegend).toBeTruthy();
      expect(signal.watchFor).toBeTruthy();
    }
  });

  it('marks remaining-points as info while time remains, warning when time is low, and critical once the sprint has ended with points still open', () => {
    const remaining = [makeIssue({ id: '1', key: 'A-1', storyPoints: 5, status: 'To Do' })];

    const plentyOfTime = getSprintSignals(SPRINT, remaining, new Date('2026-09-08T00:00:00.000Z'));
    expect(plentyOfTime.find((s) => s.id === 'remaining-points')?.severity).toBe('info');

    const lowTime = getSprintSignals(SPRINT, remaining, new Date('2026-09-19T00:00:00.000Z'));
    expect(lowTime.find((s) => s.id === 'remaining-points')?.severity).toBe('warning');

    const overdue = getSprintSignals(SPRINT, remaining, new Date('2026-09-25T00:00:00.000Z'));
    expect(overdue.find((s) => s.id === 'remaining-points')?.severity).toBe('critical');
  });
});

describe('getOverallSprintStatus', () => {
  it('is on-track when there are no signals', () => {
    expect(getOverallSprintStatus([])).toEqual({ level: 'on-track', label: 'On Track' });
  });

  it('is at-risk when the worst signal is a warning', () => {
    const signals = getSprintSignals(SPRINT, workedExampleIssues, NOW);
    expect(signals.some((s) => s.severity === 'warning')).toBe(true);
    expect(signals.some((s) => s.severity === 'critical')).toBe(false);
    expect(getOverallSprintStatus(signals)).toEqual({ level: 'at-risk', label: 'At Risk' });
  });

  it('is behind when any signal is critical, even if others are lower severity', () => {
    const remaining = [makeIssue({ id: '1', key: 'A-1', storyPoints: 5, status: 'To Do' })];
    const overdueSignals = getSprintSignals(SPRINT, remaining, new Date('2026-09-25T00:00:00.000Z'));
    expect(getOverallSprintStatus(overdueSignals)).toEqual({ level: 'behind', label: 'Behind Schedule' });
  });
});
