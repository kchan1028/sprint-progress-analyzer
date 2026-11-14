# 0005: Import what can be read, and warn about what can't

Written 2026-11-14 from the code on `main`. Label: **Current Design**. The follow-ups first listed as Proposed were implemented on 2026-11-14 and are now in the table below.

## Context

Real Jira exports are messy: custom columns, renamed headers, project-specific statuses, empty estimates, repeated
rows and dates in local formats. Rejecting any imperfect file would make the tool unusable; accepting everything
silently would make the numbers untrustworthy.

## Requirements and constraints

- Never crash on a malformed file; explain what went wrong.
- Fail only when the file can't be a Jira issue export at all.
- Keep unknowns visible (statuses, estimates) instead of guessing quietly.

## Alternatives considered

| Option | Why not |
|---|---|
| Strict schema: reject the file on any missing column or bad value | Most real exports would fail for fields the dashboard can live without |
| Silent best effort | Wrong numbers with no hint that anything was dropped |
| Accept with warnings, fail on the essentials (chosen) | The user sees what was assumed and can correct it |

## Decision

What `parseJiraCsv.ts` and `ImportPanel.tsx` do today:

| Input problem | Behaviour |
|---|---|
| Empty file | No import; warning "CSV file is empty" |
| No `Issue key` column | No import; warning asks whether this is a Jira issue export |
| No `Status` column | Imports; warning that every issue defaults to To Do |
| Row without an issue key | Row skipped with a warning naming the row number |
| Unknown status name | Defaults to To Do; one warning listing the names, and a mapping form whose choices are saved in `localStorage` |
| Status resolved by a saved mapping | Mapped as saved; after a successful import the panel lists each saved mapping applied, with its issue count and a link to edit it |
| Empty story points | Imported as unestimated (`null`) and counted by the unestimated signal |
| Non-numeric story points | Imported as unestimated (`null`); one warning with the count |
| Repeated issue key | Later rows dropped and the first row wins; one warning with the count of dropped rows |
| Empty or unparseable `Created` or `Updated` date | Falls back to the sprint start (for `Created`) or `Created` (for `Updated`); one warning per column with the count. No warning when the column is absent |
| More than 1,000 data rows | Asks before importing: the user picks Import anyway or Cancel. 1,000 rows is the largest measured size whose worst frame gap (117 ms) stayed near 100 ms; 5,000 rows froze the page for 800 ms ([performance](../performance.md)) |
| Sprint end date not after start date | Import refused with an error |
| Nothing importable | The previous data stays on screen and an error is shown |

The CSV reader follows RFC 4180 quoting (embedded commas, newlines and escaped quotes) and normalises line endings.

## Rationale

The essentials (issue key, then status) decide whether the dashboard means anything; everything else degrades with
a visible flag. Unknown statuses get a correction path rather than just a warning, because status mapping is the
most common reason numbers look wrong.

## Consequences

- Most exports import on the first try, and the user sees what was assumed.
- Every fallback in the table above except empty story points (which have their own signal) now produces a warning, so a clean import means none of them fired. It still doesn't prove the values are right (a date can parse to the wrong day).

## Risks and limits

- **Date parsing** relies on the browser's `Date`; non-ISO formats can parse differently or not at all.
- **No hard size limit.** Large files only get a confirmation step; after Import anyway, every row still renders
  and the page can stall ([performance](../performance.md)).
- **Saved mappings** apply to every import in that browser, and can be wrong for another team's workflow. Each import lists the ones it used, but nothing stops a wrong one from applying.

## When to revisit

- If real exports routinely pass 1,000 rows, virtualize long tables instead of relying on the confirmation step.
- If user exports show common formats the header or status aliases miss.
