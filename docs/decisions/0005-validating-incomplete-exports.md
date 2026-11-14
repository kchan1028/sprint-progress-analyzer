# 0005: Import what can be read, and warn about what can't

Written 2026-11-14 from the code on `main`. Label: **Current Design**, with **Proposed** follow-ups marked below.

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
| Empty or non-numeric story points | Imported as unestimated (`null`) and counted by the unestimated signal |
| Repeated issue key | Later rows dropped; the first row wins |
| Unparseable `Created` or `Updated` date | Falls back to the sprint start (for `Created`) or `Created` (for `Updated`) |
| Sprint end date not after start date | Import refused with an error |
| Nothing importable | The previous data stays on screen and an error is shown |

The CSV reader follows RFC 4180 quoting (embedded commas, newlines and escaped quotes) and normalises line endings.

## Rationale

The essentials (issue key, then status) decide whether the dashboard means anything; everything else degrades with
a visible flag. Unknown statuses get a correction path rather than just a warning, because status mapping is the
most common reason numbers look wrong.

## Consequences

- Most exports import on the first try, and the user sees what was assumed.
- Some fallbacks are silent today (see below), so a clean-looking import is not proof of a clean file.

## Risks and limits

- **Silent cases.** Repeated keys, non-numeric story points and unparseable dates produce no warning.
- **Date parsing** relies on the browser's `Date`; non-ISO formats can parse differently or not at all.
- **No size limit.** Nothing caps the file size or row count, and 5,000 rows already stall rendering
  ([performance](../performance.md)).
- **Saved mappings** apply to every import in that browser, and can be wrong for another team's workflow.

## Proposed follow-ups (not implemented)

- Warn when rows are dropped as duplicates, when story points aren't numbers, and when dates fall back.
- Warn above a row count where rendering is known to stall, before importing.

## When to revisit

- When the proposed warnings are implemented, move them into the table above and drop the Proposed label.
- If user exports show common formats the header or status aliases miss.
