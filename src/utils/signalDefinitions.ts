import type { SPRINT_THRESHOLDS } from './thresholds';

/**
 * Static, plain-English content for each sprint signal type - kept separate
 * from the calculation logic in sprintCalculations.ts so the "what does
 * this mean" copy can be edited without touching the numbers. Threshold
 * values are interpolated in since they're configurable (see thresholds.ts).
 */
export interface SignalDefinition {
  /** What the signal measures, in one sentence. */
  explanation: string;
  /** Why it matters to sprint delivery. */
  whyItMatters: string;
  /** What each color means for this specific signal (not every signal reaches every color). */
  thresholdLegend: string;
  /** What the user should do or look at next. */
  watchFor: string;
}

type Thresholds = typeof SPRINT_THRESHOLDS;

export function getSignalDefinitions(thresholds: Thresholds): Record<string, SignalDefinition> {
  return {
    'scope-added-points': {
      explanation:
        'How many story points were added to this sprint after it started, on top of the original commitment.',
      whyItMatters:
        "Every point added mid-sprint is unplanned work competing with the original commitment for the same fixed time - it's the most direct driver of scope creep.",
      thresholdLegend: 'Green: 0 SP added (signal not shown). Yellow: any SP added - the more added, the more the original plan has drifted.',
      watchFor:
        "Check whether the added points replaced something else that got dropped, or are pure addition. If it's pure addition, something has to give: scope, quality, or the deadline.",
    },
    'scope-added-issues': {
      explanation: 'How many individual tickets were added to the sprint after it started, regardless of size.',
      whyItMatters:
        'A high ticket count, even at low story points, usually means more context-switching and interruptions for the team - not just more total work.',
      thresholdLegend: 'Green: 0 tickets added (signal not shown). Yellow: any tickets added.',
      watchFor:
        'Look at who added these and why - repeated additions from the same source usually point to a planning gap rather than one-off urgency.',
    },
    'scope-removed-issues': {
      explanation: 'How many tickets were pulled out of the sprint after being committed to.',
      whyItMatters:
        'Removed tickets mean the original plan is being renegotiated mid-flight - it can be a healthy response to new information, or a sign commitments were made too early.',
      thresholdLegend: 'Green: 0 tickets removed (signal not shown). Yellow: any tickets removed.',
      watchFor:
        "Confirm removed tickets are genuinely deferred, not silently dropped - and that their points come out of the original commitment baseline for fair reporting.",
    },
    'blocked-issues': {
      explanation: 'How many tickets are currently sitting in a Blocked status.',
      whyItMatters:
        "Blocked work doesn't progress no matter how much time is left in the sprint - it's dead time until someone resolves the blocker, and it often blindsides a sprint that otherwise looks on track.",
      thresholdLegend:
        'Green: 0 blocked tickets (signal not shown). Yellow: any blocked ticket - treat every one as active risk, since blockers rarely resolve on their own.',
      watchFor:
        "Check the blocked reason and owner for each ticket (see the Current Work table) - the goal is a named next action, not just awareness that it's blocked.",
    },
    'aging-in-progress': {
      explanation: `How many tickets have been sitting in "In Progress" for ${thresholds.agingInProgressDays}+ days without moving to the next status.`,
      whyItMatters:
        "Work that's been in progress unusually long is either bigger than estimated, stuck on something not yet flagged as a blocker, or not actively being worked - all three put the remaining sprint time at risk.",
      thresholdLegend: `Green: under ${thresholds.agingInProgressDays} days in progress (signal not shown). Yellow: ${thresholds.agingInProgressDays}+ days - worth a status check.`,
      watchFor: 'Ask the assignee for a concrete blocker or ETA - if there isn\'t one, the ticket may need to be split or re-scoped.',
    },
    'stale-issues': {
      explanation: `How many tickets (not yet Done) haven't been updated at all in ${thresholds.staleDays}+ days.`,
      whyItMatters:
        'No update usually means no progress, or progress nobody knows about - either way, the board stops reflecting reality, which undermines every other signal here.',
      thresholdLegend: `Green: updated within the last ${thresholds.staleDays} days (signal not shown). Yellow: ${thresholds.staleDays}+ days with no update.`,
      watchFor:
        "Confirm the ticket is still being worked - if it's paused or abandoned, update its status so the dashboard reflects that.",
    },
    'remaining-points': {
      explanation: 'Compares the story points still left to finish against the calendar days left in the sprint.',
      whyItMatters:
        "This is the most direct \"will we finish on time\" check - remaining work that doesn't fit the remaining time is the clearest predictor of a missed sprint goal.",
      thresholdLegend: `Green: no points remain, or more than ${thresholds.lowDaysRemainingThreshold} days remain to absorb what's left. Yellow: ${thresholds.lowDaysRemainingThreshold} or fewer days remain with points still open. Red: 0 days remain (sprint end reached) with points still open.`,
      watchFor:
        'If this is Yellow or Red, decide now whether to descope, extend, or accept partial delivery - deciding on the last day is worse than deciding today.',
    },
    'unestimated-issues': {
      explanation: 'How many tickets currently in the sprint have no story point estimate.',
      whyItMatters:
        'Every unestimated ticket counts as 0 points in the story-point math elsewhere on this dashboard, so completed/remaining figures understate the real remaining work by however much these tickets are worth.',
      thresholdLegend: 'Green: 0 unestimated tickets (signal not shown). Yellow: any unestimated ticket.',
      watchFor:
        'Get these estimated as soon as possible - until then, treat every points-based figure on this dashboard as a floor, not the full picture.',
    },
  };
}
