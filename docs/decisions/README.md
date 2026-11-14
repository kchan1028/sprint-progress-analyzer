# Decision records

Why Sprint Progress Analyzer works the way it does. Each record gives the context, requirements, alternatives, the
decision and its rationale, consequences, risks and limits, and when to revisit it.

These records were written on 2026-11-14 from the code on `main` and the existing documentation. The decisions
themselves were made earlier; where the date or the reasoning at the time isn't recorded, the record says so rather
than reconstructing it.

**Labels**

- **Current Design**: implemented on `main`; the record describes the code.
- **Documented Rationale**: a choice made earlier whose reasons are written down after the fact.
- **Proposed**: not implemented.

| # | Decision | Label |
|---|---|---|
| [0001](0001-local-first-browser-processing.md) | Process sprint data in the browser, with no application backend | Current Design |
| [0002](0002-csv-import-instead-of-jira-api.md) | Import a Jira CSV export instead of calling the Jira API | Current Design |
| [0003](0003-commitment-vs-current-scope.md) | Show original commitment and current scope separately, and mark history unavailable for CSV imports | Current Design |
| [0004](0004-explainable-signals-not-forecasts.md) | Explainable rule-based signals instead of a health score or forecast | Current Design |
| [0005](0005-validating-incomplete-exports.md) | Import what can be read, and warn about what can't | Current Design, with Proposed follow-ups |

Related: [product case study](../product-case-study.md) for the product reasoning, and
[performance](../performance.md) for the measured import limits.
