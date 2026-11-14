/**
 * Configurable thresholds for sprint risk signals. Centralized here so tuning
 * "what counts as stale/aging" never requires touching component code.
 */
export const SPRINT_THRESHOLDS = {
  /** An "In Progress" issue is flagged as aging once it has been in that status this many days. */
  agingInProgressDays: 4,
  /** An issue is flagged as stale once it has had no updates for this many days. */
  staleDays: 3,
  /** Sprint is considered "at risk on time" once fewer than this many days remain. */
  lowDaysRemainingThreshold: 3,
} as const;
