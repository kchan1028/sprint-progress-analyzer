import type { Issue, Sprint, SprintChange } from '../types/jira';
import { daysBetween } from './date';
import { SPRINT_THRESHOLDS } from './thresholds';
import { getSignalDefinitions } from './signalDefinitions';

const points = (issue: Issue): number => issue.storyPoints ?? 0;

/** An issue counts as "currently in the sprint" unless it was explicitly removed. */
export const isCurrentlyInSprint = (issue: Issue): boolean =>
  issue.removedFromSprintAt == null;

export const wasAddedAfterStart = (issue: Issue, sprint: Sprint): boolean =>
  new Date(issue.addedToSprintAt).getTime() > new Date(sprint.startDate).getTime();

/** Sum of story points for issues that were part of the sprint when it started. */
export function getOriginalCommitment(issues: Issue[]): number {
  return issues
    .filter((issue) => issue.wasOriginalCommitment)
    .reduce((sum, issue) => sum + points(issue), 0);
}

/** Sum of story points for issues currently in the sprint (added minus removed). */
export function getCurrentScope(issues: Issue[]): number {
  return issues.filter(isCurrentlyInSprint).reduce((sum, issue) => sum + points(issue), 0);
}

export function getCompletedPoints(issues: Issue[]): number {
  return issues
    .filter((issue) => isCurrentlyInSprint(issue) && issue.status === 'Done')
    .reduce((sum, issue) => sum + points(issue), 0);
}

export function getRemainingPoints(issues: Issue[]): number {
  return getCurrentScope(issues) - getCompletedPoints(issues);
}

export function getInProgressPoints(issues: Issue[]): number {
  return issues
    .filter((issue) => isCurrentlyInSprint(issue) && issue.status === 'In Progress')
    .reduce((sum, issue) => sum + points(issue), 0);
}

export function getBlockedPoints(issues: Issue[]): number {
  return issues
    .filter((issue) => isCurrentlyInSprint(issue) && issue.status === 'Blocked')
    .reduce((sum, issue) => sum + points(issue), 0);
}

/** Story points added to the sprint after it started (regardless of later removal). */
export function getScopeAdded(issues: Issue[], sprint: Sprint): number {
  return issues
    .filter((issue) => wasAddedAfterStart(issue, sprint))
    .reduce((sum, issue) => sum + points(issue), 0);
}

/** Story points removed from the sprint, regardless of when they were added. */
export function getScopeRemoved(issues: Issue[]): number {
  return issues
    .filter((issue) => issue.removedFromSprintAt != null)
    .reduce((sum, issue) => sum + points(issue), 0);
}

export function getBlockedIssues(issues: Issue[]): Issue[] {
  return issues.filter((issue) => isCurrentlyInSprint(issue) && issue.status === 'Blocked');
}

export function getUnestimatedIssues(issues: Issue[]): Issue[] {
  return issues.filter((issue) => isCurrentlyInSprint(issue) && issue.storyPoints == null);
}

export function getDaysElapsed(sprint: Sprint, now: Date = new Date()): number {
  return Math.max(0, daysBetween(sprint.startDate, now));
}

export function getDaysRemaining(sprint: Sprint, now: Date = new Date()): number {
  return Math.max(0, daysBetween(now, sprint.endDate));
}

/** How many days an issue has sat in its current (most recent) status. */
export function getDaysInCurrentStatus(issue: Issue, now: Date = new Date()): number {
  const current = issue.statusHistory[issue.statusHistory.length - 1];
  if (!current) return 0;
  return daysBetween(current.enteredAt, now);
}

export function getAgingInProgressIssues(
  issues: Issue[],
  now: Date = new Date(),
  thresholdDays: number = SPRINT_THRESHOLDS.agingInProgressDays,
): Issue[] {
  return issues.filter(
    (issue) =>
      isCurrentlyInSprint(issue) &&
      issue.status === 'In Progress' &&
      getDaysInCurrentStatus(issue, now) >= thresholdDays,
  );
}

/** Issues with no updates at all for `thresholdDays`, excluding completed work. */
export function getStaleIssues(
  issues: Issue[],
  now: Date = new Date(),
  thresholdDays: number = SPRINT_THRESHOLDS.staleDays,
): Issue[] {
  return issues.filter(
    (issue) =>
      isCurrentlyInSprint(issue) &&
      issue.status !== 'Done' &&
      daysBetween(issue.lastUpdatedAt, now) >= thresholdDays,
  );
}

/** A SprintChange enriched with its issue, for display purposes. */
export interface ScopeChangeEntry extends Omit<SprintChange, 'issueId'> {
  issue: Issue;
}

/** Chronological list of add/remove scope events (see SprintChange), most recent first. */
export function getScopeChanges(issues: Issue[], sprint: Sprint): ScopeChangeEntry[] {
  const entries: ScopeChangeEntry[] = [];

  for (const issue of issues) {
    if (wasAddedAfterStart(issue, sprint)) {
      entries.push({ issue, type: 'added', date: issue.addedToSprintAt, storyPoints: issue.storyPoints });
    }
    if (issue.removedFromSprintAt) {
      entries.push({ issue, type: 'removed', date: issue.removedFromSprintAt, storyPoints: issue.storyPoints });
    }
  }

  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** completed / original commitment. Null (not 0) when there was no original commitment. */
export function getCommitmentProgress(issues: Issue[]): number | null {
  const commitment = getOriginalCommitment(issues);
  if (commitment === 0) return null;
  return getCompletedPoints(issues) / commitment;
}

/** completed / current scope. */
export function getCurrentScopeProgress(issues: Issue[]): number | null {
  const scope = getCurrentScope(issues);
  if (scope === 0) return null;
  return getCompletedPoints(issues) / scope;
}

/** (current scope - original commitment) / original commitment. */
export function getScopeChangePercent(issues: Issue[]): number | null {
  const commitment = getOriginalCommitment(issues);
  if (commitment === 0) return null;
  return (getCurrentScope(issues) - commitment) / commitment;
}

export interface CompletionEvent {
  issue: Issue;
  date: string;
}

/** When each currently-Done issue entered its Done status, for timeline plotting. */
export function getCompletionEvents(issues: Issue[]): CompletionEvent[] {
  return issues
    .filter((issue) => isCurrentlyInSprint(issue) && issue.status === 'Done')
    .map((issue) => {
      const doneEntry = issue.statusHistory.find((entry) => entry.status === 'Done');
      return { issue, date: doneEntry?.enteredAt ?? issue.lastUpdatedAt };
    });
}

export type SignalSeverity = 'info' | 'warning' | 'critical';

export interface SprintSignal {
  id: string;
  severity: SignalSeverity;
  /** The current metric that produced this signal, e.g. "14 SP added after sprint started". */
  message: string;
  /** What the signal measures, why it matters, its color legend, and what to watch - see signalDefinitions.ts. */
  explanation: string;
  whyItMatters: string;
  thresholdLegend: string;
  watchFor: string;
}

/**
 * Factual, automatically-derived risk signals. Intentionally NOT combined
 * into a single "health score" - leadership sees the individual facts and
 * draws their own conclusion.
 */
export function getSprintSignals(
  sprint: Sprint,
  issues: Issue[],
  now: Date = new Date(),
  thresholds: typeof SPRINT_THRESHOLDS = SPRINT_THRESHOLDS,
): SprintSignal[] {
  const definitions = getSignalDefinitions(thresholds);
  const signals: Array<{ id: string; severity: SignalSeverity; message: string }> = [];

  const scopeAddedPoints = getScopeAdded(issues, sprint);
  const addedIssues = issues.filter((issue) => wasAddedAfterStart(issue, sprint));
  const removedIssues = issues.filter((issue) => issue.removedFromSprintAt != null);
  const blockedIssues = getBlockedIssues(issues);
  const agingIssues = getAgingInProgressIssues(issues, now, thresholds.agingInProgressDays);
  const staleIssues = getStaleIssues(issues, now, thresholds.staleDays);
  const remainingPoints = getRemainingPoints(issues);
  const daysRemaining = getDaysRemaining(sprint, now);
  const unestimatedIssues = getUnestimatedIssues(issues);

  if (scopeAddedPoints > 0) {
    signals.push({
      id: 'scope-added-points',
      severity: 'warning',
      message: `${scopeAddedPoints} SP added after sprint started`,
    });
  }

  if (addedIssues.length > 0) {
    signals.push({
      id: 'scope-added-issues',
      severity: 'warning',
      message: `${addedIssues.length} ticket${addedIssues.length === 1 ? '' : 's'} added after sprint started`,
    });
  }

  if (removedIssues.length > 0) {
    signals.push({
      id: 'scope-removed-issues',
      severity: 'warning',
      message: `${removedIssues.length} ticket${removedIssues.length === 1 ? '' : 's'} removed from sprint`,
    });
  }

  if (blockedIssues.length > 0) {
    signals.push({
      id: 'blocked-issues',
      severity: 'warning',
      message: `${blockedIssues.length} blocked ticket${blockedIssues.length === 1 ? '' : 's'}`,
    });
  }

  if (agingIssues.length > 0) {
    signals.push({
      id: 'aging-in-progress',
      severity: 'warning',
      message: `${agingIssues.length} ticket${agingIssues.length === 1 ? '' : 's'} have been In Progress for more than ${thresholds.agingInProgressDays} days`,
    });
  }

  if (staleIssues.length > 0) {
    signals.push({
      id: 'stale-issues',
      severity: 'warning',
      message: `${staleIssues.length} ticket${staleIssues.length === 1 ? '' : 's'} have had no activity for ${thresholds.staleDays}+ days`,
    });
  }

  const remainingPointsSeverity: SignalSeverity =
    remainingPoints > 0 && daysRemaining <= 0
      ? 'critical'
      : remainingPoints > 0 && daysRemaining <= thresholds.lowDaysRemainingThreshold
        ? 'warning'
        : 'info';

  signals.push({
    id: 'remaining-points',
    severity: remainingPointsSeverity,
    message: `${remainingPoints} SP remain with ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`,
  });

  if (unestimatedIssues.length > 0) {
    signals.push({
      id: 'unestimated-issues',
      severity: 'warning',
      message: `${unestimatedIssues.length} unestimated ticket${unestimatedIssues.length === 1 ? '' : 's'}`,
    });
  }

  return signals.map((signal) => ({ ...signal, ...definitions[signal.id] }));
}

export interface OverallSprintStatus {
  level: 'on-track' | 'at-risk' | 'behind';
  label: string;
}

/**
 * A single at-a-glance status derived from the worst signal currently
 * present - NOT a combined score. It exists so a reader can tell "is this
 * sprint fine or not" in the first second of looking at the dashboard; the
 * individual facts behind it are exactly the signals listed in
 * getSprintSignals, right below it.
 */
export function getOverallSprintStatus(signals: SprintSignal[]): OverallSprintStatus {
  if (signals.some((signal) => signal.severity === 'critical')) {
    return { level: 'behind', label: 'Behind Schedule' };
  }
  if (signals.some((signal) => signal.severity === 'warning')) {
    return { level: 'at-risk', label: 'At Risk' };
  }
  return { level: 'on-track', label: 'On Track' };
}
