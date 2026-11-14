# 0003: Show original commitment and current scope separately, and mark history unavailable for CSV imports

Written 2026-11-14 from the code on `main`. Label: **Current Design**. Commit `4630e61` (PR 5, 2026-11-13) added the
"unavailable" labels for CSV imports; before that, imports reconstructed the historical fields
([case study](../product-case-study.md#the-scope-decision)).

## Context

Completed points alone can make a sprint look healthy while scope grows underneath it. Separating "what we
committed to at the start" from "what is in the sprint now" makes scope change visible. That needs to know when
each issue joined or left the sprint, which a CSV export does not contain.

## Requirements and constraints

- Never show a precise-looking number the data can't support.
- Keep both progress views for data that does have history (the synthetic demo today).
- Unestimated issues must stay visible, not silently count as zero work.

## Alternatives considered

| Option | Why not |
|---|---|
| A single progress number against current scope | Hides scope growth, the thing a sprint review most needs to discuss |
| Infer commitment from `Created` dates in the CSV | `Created` is when the issue was created, not when it joined the sprint |
| Reconstruct history and show it as if exact | What the first version did. Replaced because it invited wrong decisions |
| Both views, with CSV history marked unavailable (chosen) | Honest about the source; the full model still works where history exists |

## Decision

`sprintCalculations.ts` computes original commitment (issues with `wasOriginalCommitment`), current scope (issues
not removed), scope added after the start and scope removed. For CSV imports every issue is treated as original
commitment at the sprint start, and `DashboardPage` sets `historyAvailable = sprint.source === 'demo'`. When it is
false, original commitment, commitment progress, scope-change percent and the scope-change table show
"Unavailable", aging messages say "Estimated aging", and timeline dates are labelled estimates. Progress with a
zero denominator returns `null` and renders as unavailable.

## Consequences

- The scope-change view, the product's most distinctive idea, currently works only on the synthetic demo.
- A CSV import with no scope-change signals means "unknown", not "stable"; the UI and README say so.

## Risks and limits

- Readers can still misread "Unavailable" as zero if they skim. The data-confidence banner above the KPIs is the
  mitigation.
- Story points are counted as they are now; estimate changes during the sprint are invisible in a CSV.

## When to revisit

- A changelog-backed source exists ([0002](0002-csv-import-instead-of-jira-api.md)): then compute commitment from
  sprint membership at the start date and remove the CSV-only labels for that source.
