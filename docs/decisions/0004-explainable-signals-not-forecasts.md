# 0004: Explainable rule-based signals instead of a health score or forecast

Written 2026-11-14 from the code on `main`. Label: **Current Design**.

## Context

A sprint review needs to know what is at risk and why. A single score or a predicted finish date is quick to read,
but it hides which facts produced it, and with snapshot data ([0002](0002-csv-import-instead-of-jira-api.md)) a
forecast would rest on estimated dates.

## Requirements and constraints

- Every warning must point to the tickets and the rule behind it.
- No individual productivity scoring.
- Work with one sprint of snapshot data, with no capacity or velocity history.

## Alternatives considered

| Option | Why not |
|---|---|
| A weighted health score (0 to 100) | The weights would be invented, and the score hides which fact moved it |
| A completion forecast (burndown projection, Monte Carlo on throughput) | Needs reliable history across sprints and real transition dates; CSV imports have neither |
| Per-person metrics | Invites rating individuals, which the tool is explicitly not for |
| Independent rules with stated thresholds (chosen) | Each signal is a fact anyone can check |

## Decision

`getSprintSignals` evaluates fixed rules: scope added after the start (points and tickets), tickets removed, blocked
tickets, tickets In Progress longer than 4 days, tickets with no update for 3 or more days, remaining points
against days left, and unestimated tickets. Thresholds live in `src/utils/thresholds.ts`. Each signal carries
plain-English copy from `signalDefinitions.ts`: what it measures, why it matters, what each colour means and what to
look at next. The headline status is the worst severity present: any critical signal gives "Behind Schedule", any
warning gives "At Risk", otherwise "On Track". It is not a combined score.

## Rationale

People can disagree with a rule and still trust the number, because they can see exactly what it counts. That
matters more than precision for a tool meant to start a conversation.

## Consequences

- No prediction of a finish date or of whether the sprint will make it.
- Thresholds are fixed in code; changing them is a code change.

## Risks and limits

- The headline is coarse. One unestimated ticket or one stale ticket is enough for "At Risk", the same as several
  blocked tickets. The signal list beneath it is the detail.
- Days are calendar days, so weekends count towards "stale" and "aging".
- For CSV imports, aging uses `Updated` as the status-entry date, so any edit resets it ([0003](0003-commitment-vs-current-scope.md)).
- "Behind Schedule" fires only when points remain after the end date; there is no earlier pace-based warning.

## When to revisit

- User feedback shows the headline is misleading or ignored: consider severity tiers per signal or making
  thresholds configurable.
- Changelog data across several sprints exists: a forecast becomes possible, and should be shown with its
  uncertainty, next to the rules rather than instead of them.
