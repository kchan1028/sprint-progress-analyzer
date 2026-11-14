# Risk register

Material risks for Sprint Progress Analyzer as of 2026-11-14, ranked by exposure. The area-by-area status is in
[production readiness](production-readiness.md).

**Assumptions behind every likelihood below:** one person imports a single-sprint Jira CSV of up to a few hundred
issues into a current desktop browser, from a static deployment or a local build, with analytics unconfigured unless
stated. If imports routinely reach thousands of rows, or the tool is used across teams, re-rate the affected risks.

Scale: **Impact** is the harm to a decision or to the user's data. **Likelihood** is how likely it is under the
assumptions above. Both are Low, Medium or High.

| ID | Risk | Impact | Likelihood | Existing mitigation | Remaining exposure | Next action |
|---|---|---|---|---|---|---|
| R1 | **Misleading metrics from snapshot data**: a reader takes "no scope change" as stable scope, or trusts aging after a ticket was edited | High: a sprint conversation focuses on the wrong problem | Medium: the UI labels it, but readers skim | Data-confidence banner; commitment and scope change shown as "Unavailable" for CSV; aging prefixed "Estimated"; timeline dates labelled estimates; README and user guide explain the limits | Labels depend on being read; `Updated` changes on any edit | Test the labels in the planned user sessions; consider hiding unavailable panels for CSV instead of showing them empty |
| R2 | **Input fallbacks misread**: repeated keys dropped, non-numeric points read as unestimated, bad dates replaced | Medium: totals or aging are wrong | Low: each fallback now warns with a count | Every fallback warns: missing key and status columns, rows without keys, unknown statuses, dropped duplicate rows, non-numeric story points, and `Created`/`Updated` dates that fell back; unit tests cover each count | Warnings depend on being read; a date the browser parses to the wrong day is not caught | Watch for missed warnings in the planned user sessions |
| R3 | **Wrong status mapping**: an unknown or team-specific status defaults to To Do, or a saved mapping from another team is reused | High: completed or blocked work is counted as not started | Medium: custom workflows are normal; mappings persist per browser | Warning lists unknown statuses; mapping form; saved mappings can be edited and reset; each import lists the saved mappings it applied, with issue counts and an Edit saved mappings button | A mapping saved for one team still applies to every import in that browser; the list depends on being read | Consider per-team mapping sets if the tool is used across teams |
| R4 | **Large imports stall the page** | Medium: the page freezes; users may think it crashed | Low: files over 1,000 rows ask first | Measured and documented: 5,000 rows showed an 800 ms frame gap; imports over 1,000 data rows show a warning with Import anyway and Cancel before rendering | No hard limit; after Import anyway all rows and markers render | Virtualize long tables and move parsing to a Web Worker if real exports need it |
| R5 | **Work data exposed in the browser**: extensions, same-origin scripts, or a shared device's saved mappings | Medium: ticket summaries and names are employer data | Low: needs a malicious extension, a compromised host or a shared device | Processing stays in the browser; imports are memory-only; SECURITY.md says to use synthetic data on unfamiliar deployments | No CSP; status names persist in `localStorage` | Add a Content Security Policy and other security headers on the host; note the reset button in the import panel |
| R6 | **Third-party analytics on a sensitive page** | Low: page URL and title go to Google, not CSV contents | Low: off unless a measurement ID is set in a production build | Off by default; documented in README and SECURITY.md; advertising hard-disabled in code | If configured, a third-party script runs on the page with the data | Keep it unset for any deployment used with real work data |
| R7 | **Render error blanks the page** | Medium: the user loses the import | Low: a top-level error boundary catches it | Unit, component and browser tests; data-loading errors caught; top-level React error boundary shows a recovery screen with Reset to demo data | The import is lost on reset; errors are only logged to the browser console | Add an error-boundary path to the browser tests if render errors are reported |
| R8 | **Regression merges without checks**: CI checks aren't required status checks | Medium: a broken build or a calculation bug reaches `main` | Low: one maintainer who runs the checks | CI runs on every PR; README states the checks aren't required | Depends on discipline | Make the CI jobs required checks on `main` |
| R9 | **Usefulness unproven**: the problem and signals are a hypothesis | High for adoption: effort goes into features nobody needs | Medium: no user sessions held yet | Case study states this; feedback worksheet ready | No evidence either way | Hold the planned sessions before building forecasts or integrations |

## Not rated as material

- **Server outages, backups and retries**: there is no server or stored data.
- **Hosting cost**: static files only.
- **Secrets leakage**: the app needs none, and docs warn that `VITE_*` values are public.
