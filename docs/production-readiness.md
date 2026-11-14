# Production readiness

An honest assessment of Sprint Progress Analyzer, area by area, as of 2026-11-14 (commit `836a0e5`).

**Summary.** A static, browser-only tool that works for single-sprint CSV imports of ordinary size and is well
tested for that path. It is suitable for an individual trying it with synthetic or permitted data. It is **not
ready to rely on for delivery decisions without reading the limits**: CSV imports can't show scope history, large
imports still stall the page after a confirmation, and nobody outside the author has used it yet.
Passing tests show the code behaves as designed. They don't show the numbers are right for a given team's export.

Material risks, with impact, likelihood and next actions, are in the [risk register](risk-register.md).

## Status key

| Status | Meaning |
|---|---|
| **Verified** | Implemented and checked by an automated test, a recorded measurement or a documented review |
| **Implemented** | In the code, but not independently checked beyond normal use |
| **Partial** | Some of it exists; the gaps are named |
| **Planned** | Not built; named as a next step in the README or docs |
| **Not applicable** | Out of scope for a static, browser-only app, with the reason |

## Assessment

| Area | Status | Evidence | Gaps and limits |
|---|---|---|---|
| Unit and component tests | Verified | Vitest with jsdom covers calculations, CSV parsing, workflow grouping, saved mappings, import errors and data provenance; runs in CI | |
| Browser and accessibility tests | Verified | Playwright covers the import, mapping and reset journey, invalid imports, keyboard paths and axe scans in Chromium at desktop and phone widths, and in Firefox and WebKit at desktop width ([accessibility](accessibility.md)) | In Firefox, the post-import axe scan excludes the data-confidence section to avoid a page crash under axe (R10). No screen-reader testing. Passing axe is not a WCAG conformance claim |
| CI | Verified | [ci.yml](../.github/workflows/ci.yml): clean install, unit tests, lint, type check and build, Playwright; read-only token, pinned actions, no secrets | Both jobs (`Tests, lint, and build`, `Dependency review`) are required status checks on `main` through the default-branch ruleset. PR branches don't have to be up to date with `main` before merging |
| Dependencies | Verified | Three runtime dependencies (React, React DOM, React Router); lockfile; dependency review blocks high and critical advisories on PRs; monthly Dependabot | Major-version Dependabot PRs (jsdom, Vitest UI) are open and unreviewed |
| Authentication and authorization | Not applicable | No backend and no shared data; each browser holds its own import | A hosted copy is as open as its host makes it |
| Input validation | Verified | Missing issue key or empty file refuses the import; missing status column, unknown statuses, dropped duplicate rows, non-numeric story points and fallback dates warn with counts; files over 1,000 rows ask before importing; end date must be after start date. Covered by `parseJiraCsv.test.ts` and `ImportPanel.test.tsx` | No hard file-size or row limit. A date the browser parses to the wrong day is not detected |
| CSV parsing correctness | Verified | RFC 4180 quoting, embedded newlines, escaped quotes, header aliases and duplicate keys covered by `parseJiraCsv.test.ts` | Date parsing uses the browser's `Date`; non-ISO formats are unreliable |
| Metric correctness | Partial | Pure functions with edge-case tests (zero denominators, unestimated issues, removed issues) | Correct for the data model, but CSV data lacks history: commitment and scope change are shown as unavailable, aging and completion dates are estimates from `Updated` |
| Secrets | Verified | No secrets are needed. `.env.example` and SECURITY.md say every `VITE_*` value is public | |
| Data protection | Partial | CSV is parsed in the browser and held in memory only; only theme and status mappings persist in `localStorage` | Optional Google Analytics sends page URL and title when configured in production. Extensions and same-origin scripts can read the data. Saved status names can reveal workflow details on shared devices |
| Security headers | Verified | `vercel.json` sends a Content Security Policy (no `unsafe-inline` or `unsafe-eval`; the inline theme script is allowed by hash; Google Analytics origins only), plus `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` and HSTS. `vite preview` serves the same headers, so every Playwright test runs under the CSP, and one test fails on any CSP violation. `securityHeaders.test.ts` checks the script hash matches `index.html` | Applies only on Vercel; another host needs the same headers configured. Editing the inline theme script means updating its hash (the unit test fails until you do). Not checked against a live deployment |
| Error handling | Verified | Import errors and warnings shown with alert and status roles; data loading errors caught in `useSprintData`; analytics failures can't break the app; a top-level error boundary replaces a blank page with a recovery screen and Reset to demo data (`ErrorBoundary.test.tsx`) | Render errors are logged to the browser console only, and resetting drops the import |
| Retries | Not applicable | No network calls in the data path | |
| Observability | Not applicable | No backend to monitor. Optional analytics counts page views only | No error reporting from users' browsers. Problems surface only when someone reports them |
| Deployment | Implemented | Static build; `vercel.json` rewrites SPA routes; `noindex` metadata; advertising hard-disabled in code | A hosted synthetic demo exists for private review only; no public deployment is advertised |
| Rollback | Implemented | Static hosts keep earlier builds; every merge to `main` is a buildable commit | No documented rollback procedure or release tags |
| Backup | Not applicable | No server-side data. Imports are deliberately not stored | Users keep their own CSVs |
| Performance | Partial | Parser: 10,000 rows in a median 29 ms; browser import of 5,000 rows completes in about 1.4 s with an 800 ms frame gap ([performance](performance.md)) | One machine, no CPU throttling. Imports over 1,000 rows ask first, but after confirming all rows and timeline markers render, so large imports stall |
| Cost | Not applicable | Static hosting; no per-user processing cost | |
| Product validation | Planned | A feedback worksheet exists ([user feedback](user-feedback.md)) | No user sessions held yet. Usefulness is a hypothesis |
| Licensing | Partial | Dependency licences are their own | No project licence selected |

## Known limitations

From the README and confirmed in the code:

- CSV imports treat every issue as original commitment; scope changes can't be inferred.
- `Updated` stands in for status-entry and completion dates, so aging can be wrong after any edit.
- Unknown statuses default to To Do until mapped. Mappings are saved per browser and may not fit another team.
- Thresholds are fixed in code; days are calendar days; there is no capacity model, trend or forecast.
- Imports are memory-only and are lost on refresh.

## What would change before relying on it for team decisions

1. Hold the planned user sessions and act on what they show.
2. Test with a screen reader.
3. Evaluate changelog-backed data before adding any forecast.
