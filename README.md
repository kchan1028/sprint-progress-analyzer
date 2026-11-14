# Sprint Progress Analyzer

A local-first Jira sprint dashboard for engineering managers, delivery leads, and teams reviewing delivery risk. It puts commitment, current scope, blocked work, aging issues, and missing estimates in one view so a sprint conversation can focus on decisions and follow-up.

## Try it

For prerequisites, step-by-step instructions, and troubleshooting, see [setup.md](setup.md).

```bash
npm ci
npm run dev
```

Open http://localhost:5173/dashboard for the synthetic demo, or http://localhost:5173/analyze to import a CSV. The homepage is at `/`. Demo dates are relative to the current date; demo people and tickets are fictional.

For a reproducible import, select [examples/sprint.csv](examples/sprint.csv), set sprint dates to November 2–16, 2026, and import. Map `Discovery` to your chosen status and re-import. This fixture is synthetic; its dates are fixed, so aging signals depend on when you open it. Reset to demo data to return to the rolling demo.

No hosted demo or screenshot is included yet. Local test and build verification is described below.

For a plain-English walkthrough, read [Reading your sprint dashboard](docs/user-guide.md): importing a file, understanding the numbers, and turning risk signals into team conversations.

## Demo at a glance

The built-in synthetic sprint starts with **80 story points** of commitment. Adding 17 and removing 3 brings current scope to **94 points**: 53 completed and 41 remaining.

```mermaid
pie showData
  title Synthetic demo — current scope by status (story points)
  "Done" : 53
  "In Progress" : 14
  "Blocked" : 11
  "In Review" : 3
  "To Do" : 13
```

This is a data visualization of [the demo fixture](src/data/mockData.ts), not a screenshot or forecast. Unestimated issues contribute no points to this chart and are flagged separately in the dashboard. The 11 blocked points and added scope give a reviewer concrete risks to discuss alongside completion progress.

## From sprint data to a team conversation

```mermaid
flowchart TD
  Start[Open the app] --> Choice{Choose a data source}
  Choice --> Demo[Explore the fictional sprint]
  Choice --> Export[Export one sprint from Jira as CSV]
  Export --> Import[Enter sprint dates and import in the browser]
  Import --> Check[Review warnings and correct status mappings]
  Demo --> Review[Read progress and risk signals]
  Check --> Review
  Review --> Tickets[Inspect the tickets behind each signal]
  Tickets --> Discuss[Agree on follow-up with the team]
```

The dashboard supports the conversation; it does not change Jira tickets or make delivery commitments for the team. See [the user guide](docs/user-guide.md) for what each signal means.

## Working features

- Commitment, current scope, completed, remaining, in-progress, and blocked story-point totals.
- Separate progress views for original commitment and current scope.
- Delivery pipeline, explanatory risk signals, issue filters, timeline, and scope-change table.
- CSV parsing with quoted fields, embedded newlines, header aliases, duplicate-key suppression, and import warnings.
- Custom status corrections saved in browser localStorage, with edit and reset controls.
- Light/dark theme and responsive layouts.

Historical scope changes are demonstrated by the built-in dataset. A standard CSV import does **not** contain the history needed to recover them.

## Architecture

React 19, TypeScript, Vite 8, React Router 7, plain CSS, and Vitest with jsdom. No application backend or direct Jira API connection.

```mermaid
flowchart LR
  Demo[Synthetic demo] --> Service[In-memory CsvJiraService]
  CSV[User-selected CSV] --> Parser[CSV parser and status normalization]
  Parser --> Service
  Service --> Hook[useSprintData subscription]
  Hook --> Dashboard[DashboardPage]
  Dashboard --> Calculations[Pure calculations and thresholds]
  Calculations --> Views[KPIs, signals, tables, timeline]
  Storage[localStorage status mappings] --> Parser
```

`src/types/jira.ts` defines the domain model. `src/services/jira/` contains the service interface and CSV-backed implementation. `src/utils/` holds parsing, calculations, workflow grouping, and thresholds. Pages compose components; the hook subscribes to import/reset notifications. CSV content lives only in memory and is lost on refresh; theme and status mappings persist locally.

## Engineering decisions and tradeoffs

- **Start with CSV:** useful without credentials, OAuth, or a server. The cost is incomplete historical data and manual exports. Filter the Jira export to the intended sprint before importing; the parser does not select a sprint from a multi-sprint export.
- **Keep risk explainable:** individual signals expose the facts and threshold rationale. The headline status reflects the worst signal severity; it is a heuristic, not a delivery forecast or productivity score.
- **Separate calculations from rendering:** pure functions make scope accounting and edge cases directly testable. A service interface separates reads from the UI, but live Jira integration would still require authentication, pagination, historical-data handling, and changes to the CSV-specific import flow.
- **Use small dependencies:** local state, a service subscription, CSS progress bars, and a CSS timeline fit this single-sprint tool without a global state or charting library.
- **Expose uncertainty:** null estimates remain visible rather than silently counting as estimated work; zero-denominator progress is represented as unavailable.

## Setup and configuration

Use Node.js 22.12+ and npm. A lockfile is committed; `npm ci` installs its exact dependency resolution. No environment variables are required.

Optionally copy `.env.example` to `.env.local`. All `VITE_*` values are public browser configuration and must never contain secrets. Empty values leave analytics and ad placements unconfigured. Google Analytics loads only in production when a measurement ID is set. Advertising script loading is explicitly disabled in `src/utils/adsense.ts`; publisher IDs alone do not enable it. `public/ads.txt` contains a pre-existing public publisher declaration, not a credential.

Imports are parsed locally and are not explicitly sent by the app to an API. Optional third-party analytics receives page views, including page URL/title; avoid sensitive information in URLs and leave it disabled for a minimal local setup. Third-party scripts should be reviewed before enabling them for sensitive workflows.

```bash
npm run test     # unit tests for calculations, CSV parsing, workflow, mappings
npm run lint     # static analysis
npm run build    # TypeScript checks and production bundle
npm run preview  # serve the production bundle locally (after build)
```

The existing `vercel.json` rewrites SPA routes to `index.html`. Other hosts need equivalent route fallback. The existing noindex metadata and disabled advertising policy are preserved; publishing the source does not configure hosting.

## Validation

The preparation checks passed: 54 tests across five suites, lint, and a TypeScript/production build. Tests cover calculation edge cases, CSV parsing, workflow grouping, persisted mapping behavior, and import error feedback. They are not browser end-to-end tests. See [docs/publication-review.md](docs/publication-review.md) for the publication review scope.

## Known limitations and next steps

- CSV imports treat every issue as original commitment. Scope additions/removals cannot be inferred; zero changes means unavailable history, not proof of stable scope.
- The `Updated` timestamp approximates entry into the current status and completion dates. Edits can make aging/timeline values misleading; Jira date formats also depend on browser parsing. Prefer ISO dates in exports.
- Unknown statuses default to To Do until corrected. Saved mappings apply within the browser origin and can be wrong for another team's workflow.
- Thresholds are fixed in code, days are calendar days, and there is no capacity model, cross-sprint trend, or prediction.
- Imports are memory-only, and large-file performance has not been benchmarked. Automated coverage focuses on utilities and import error feedback, with no complete browser regression suite.
- Next steps: add browser tests for imports and mapping corrections, show explicit provenance/availability on historical metrics, and evaluate changelog-backed data before building forecasts.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting, data-handling boundaries, and deployment considerations.

## License

No project license has been selected. Public availability does not grant a general license to reuse the project. Dependency licenses remain their own.
