# Reading your sprint dashboard

Sprint Progress Analyzer helps a team answer three questions: how much work is left, what is getting in the way, and what needs a conversation today? Use it during a stand-up or sprint review to find tickets to discuss with the team.

## Start with the demo

Follow the [local setup instructions](../README.md#try-it), then open `/dashboard`. The demo contains fictional tickets and people. Its sprint dates move with the current date, so you can explore an active sprint without preparing an export.

Start with the progress cards, read the signals, and use the filters under **Issues Requiring Attention** to find the tickets behind them. **All** includes completed work too; the section is not limited to flagged tickets.

## Bring your own sprint

1. In Jira, filter an issue search to the sprint you want to review and export it as CSV. This app does not filter a multi-sprint export for you.
2. Open `/analyze`, enter a sprint name and its start and end dates, then choose your CSV. The end date must be later than the start date.
3. Select **Import** and read the notes below the form. The file needs an **Issue key** column. Including Summary, Status, Assignee, Story Points, Created, and Updated makes the dashboard more useful. ISO dates are the safest choice.
4. Correct unfamiliar statuses and select **Re-import with these mappings**. Unrecognized statuses initially count as **To Do**.

You can try these steps with [the example CSV](../examples/sprint.csv). Its dates are fixed; use November 2–16, 2026 to match the example. It includes a `Discovery` status so you can practice mapping it.

A successful import replaces the demo in memory. **Reset to demo data** restores it. Refreshing the page also clears imported tickets. Status corrections remain saved in this browser; edit or remove them under **Saved Status Mappings**. Those saved choices may need changing if another team's workflow uses the same words differently.

## What the numbers mean

A story point is a team's estimate of work. The app adds up those estimates; it does not turn them into hours or compare one person's output with another's.

| Dashboard term | In everyday language |
| --- | --- |
| Original commitment | The estimated work included when the sprint started. |
| Current scope | The estimated work currently in the sprint, including later additions and excluding removals. |
| Completed | Points on tickets currently in the sprint whose normalized status is Done. |
| Remaining | Current scope minus completed points. This includes blocked and not-yet-started work. |
| Unestimated | Tickets with no usable point estimate. They appear in the ticket list but add no points to the totals. |

The two progress bars answer different questions. In the demo, 53 completed points out of 80 originally committed points is about **66%**. The same 53 points out of the current 94-point scope is about **56%**. The gap shows how changing scope affects the delivery conversation. These ratios do not predict a finish date.

## Turn a signal into a question

The app uses fixed rules to draw attention to work. A flag is a reason to check the situation with the team.

| Signal | Current rule | A useful question |
| --- | --- | --- |
| Blocked | A current ticket is marked Blocked. | What dependency or decision would let this move? |
| Aging | A current In Progress ticket has spent at least 4 calendar days in that status. | Is the work larger than expected, or does it need help? |
| Stale | An unfinished current ticket has not been updated for at least 3 calendar days. | Is the ticket still accurate, or has progress happened elsewhere? |
| Unestimated | A current ticket has no usable estimate. | Do we understand enough about this work to plan it? |
| Remaining work near the end | Points remain with 3 or fewer calendar days left; this becomes critical when no days remain. | What can we finish, split, or explicitly move out? |

The headline **At Risk** means at least one warning exists. **Behind Schedule** means a critical signal exists. **On Track** means neither is present. These labels summarize the rules; they do not account for team capacity, holidays, or work happening outside Jira.

The workflow panel groups work into delivery stages such as Code Review and Testing. It can recognize the original Jira status more precisely than the five general statuses used for point calculations. A saved status correction therefore does not always change the workflow panel's stage.

## Know what a CSV cannot tell you

A normal Jira CSV is a snapshot: it tells you where a ticket is now, but not every step it took to get there. The app treats imported tickets as if they all belonged to the sprint at the start. It uses the **Updated** date as an approximation for when the current status began.

That means an imported sprint showing no scope changes does not prove that scope stayed stable. A ticket updated yesterday may have been in progress for a week. Completion dates and the timeline are approximate too. Use those views as prompts for discussion, and check Jira before making a delivery decision that depends on history.

The built-in demo includes made-up history to demonstrate the scope-change and timeline views. A CSV import cannot reproduce that level of detail.

## Where your data goes

The app reads the CSV in your browser and holds imported tickets in memory. It has no application server that receives the file. Theme settings and status corrections are saved locally; clearing this site's browser data removes them.

No configuration is needed for local use. Optional production analytics can send page views, including the URL and page title, to Google if configured. Advertising script loading is currently disabled. See [configuration and privacy details](../README.md#setup-and-configuration) before enabling third-party services for a deployment.
