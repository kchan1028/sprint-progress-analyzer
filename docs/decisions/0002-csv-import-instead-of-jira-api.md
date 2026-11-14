# 0002: Import a Jira CSV export instead of calling the Jira API

Written 2026-11-14 from the code on `main`. Label: **Current Design**.

## Context

Jira data can come from a CSV export of an issue search or from the Jira REST API. The API can return changelogs
(when an issue joined the sprint, when its status changed); a normal CSV export is a snapshot without them.

## Requirements and constraints

- No credentials, OAuth app or backend ([0001](0001-local-first-browser-processing.md)).
- Work with whatever Jira workflow and status names a team uses.
- Be honest about what the data source can and can't show.

## Alternatives considered

| Option | Why not, for now |
|---|---|
| Jira Cloud REST API from the browser with a user's API token | The token would sit in the browser, and browser calls to the Jira API run into cross-origin restrictions that usually need a proxy. Needs pagination and rate-limit handling |
| Jira API through a small backend or an Atlassian Forge/Connect app | Credential storage, hosting and an app review process before anyone can try it |
| CSV export (chosen) | Works today with no setup, from any Jira instance that allows exports |

## Decision

Accept one CSV export per sprint. The parser matches common header names (`Issue key`, `Status`, `Story Points`,
`Story point estimate`, `Custom field (Story Points)` and others), maps common status names to five stages, and lets
the user map unknown statuses. The user enters sprint name and dates, because the export does not carry them
reliably. The `JiraService` interface (`getCurrentSprint`, `getSprintIssues`, `getIssueChangelog`, `subscribe`)
separates data loading from the UI, so a future API-backed source has a defined seam.

## Rationale

The CSV path is the only one that needs no setup. The cost is real and shown in the UI rather than hidden: a CSV
snapshot can't tell when an issue joined the sprint or entered its status ([0003](0003-commitment-vs-current-scope.md)).

## Consequences

- Manual export for every review.
- The user must filter the export to one sprint; the parser does not pick a sprint out of a multi-sprint export.
- Status history is reduced to one entry dated at `Updated`, so aging and completion dates are estimates.

## Risks and limits

- Header names vary across Jira versions and locales; an unrecognised story-points header means every issue is
  unestimated.
- Dates are parsed with the browser's `Date`, which handles ISO dates reliably and other formats inconsistently.
- The service interface is a seam, not an integration: authentication, pagination and changelog handling would
  still need real work, and the import panel is CSV-specific.

## When to revisit

- User research shows the manual export is the main barrier to regular use.
- Changelog-backed history is needed for commitment and scope-change figures on real data.
