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

/**
 * Imports with more data rows than this ask for confirmation before they render.
 * In docs/performance.md, 1,000 rows was the largest measured size whose worst frame
 * gap (117 ms) stayed close to the 100 ms point where a page starts to feel unresponsive;
 * 5,000 rows froze the page for 800 ms. A single sprint is normally well under 1,000
 * issues, so a larger file is usually a whole-project export.
 */
export const LARGE_IMPORT_ROW_WARNING = 1000;
