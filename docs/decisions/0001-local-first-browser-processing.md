# 0001: Process sprint data in the browser, with no application backend

Written 2026-11-14 from the code on `main`. Label: **Current Design**. The original decision date is not
recorded; the design was already in place in the first public commit (2026-11-13).

## Context

The people this is for (engineering managers, delivery leads, teams) review sprints with Jira data that belongs to
their employer. Many can't send that data to an unknown service, and many can't create Jira API credentials or an
OAuth app just to try a tool.

## Requirements and constraints

- Someone must be able to try the tool without credentials, an account or a server.
- Imported work data should not leave the browser because of anything the app does.
- One person maintains it, so there should be nothing to operate between releases.
- It must be deployable as static files.

## Alternatives considered

| Option | Why not |
|---|---|
| Upload the CSV to a server that parses and stores it | Needs hosting, storage, authentication, retention rules and a privacy policy for employer data. Raises the bar to try it |
| Server-side Jira integration | Same, plus credential storage (see [0002](0002-csv-import-instead-of-jira-api.md)) |
| Desktop app | Heavier to build, sign and distribute than a static web app, for no gain at this scope |
| Static single-page app that parses in the browser (chosen) | No backend, no credentials, works offline once loaded |

## Decision

React, TypeScript and Vite build a static app. The CSV is read with `File.text()` and parsed in the main thread
(`src/utils/parseJiraCsv.ts`). Imported issues live only in memory in `CsvJiraService` and are lost on refresh.
Only the theme and custom status mappings persist, in `localStorage`. `vercel.json` only rewrites routes to
`index.html`.

## Rationale

It removes the hardest adoption question ("can I send this data somewhere?") and all server operations. The cost
is accepted in the open: no history across sessions, no sharing, and browser limits on large files.

## Consequences

- Nothing to run, patch or back up on a server.
- Every refresh loses the import; there are no saved sprints or trends.
- Parsing and rendering share the main thread. The 5,000-row browser import showed an 800 ms frame gap
  ([performance](../performance.md)).

## Risks and limits

- Local processing is not an isolation boundary: browser extensions, other scripts on the same origin or a
  compromised device can read the data ([SECURITY](../../SECURITY.md)).
- Optional Google Analytics, when configured in a production build, sends page URL and title to a third party. It
  does not send CSV contents, but it is still a third-party script on the page.
- No sign-in or access control exists. A hosted copy is as public as its host makes it.

## When to revisit

- Users need saved sprints, sharing or cross-sprint trends: that needs storage, and then authentication.
- Large exports are common: move parsing to a Web Worker and virtualize long tables first, before any server.
