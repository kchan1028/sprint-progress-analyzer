# Making sprint risk easier to discuss

## The problem

A sprint board shows where tickets sit, but a team reviewing delivery also needs to understand what changed, what is blocked, and how much unfinished work remains. Those questions can require moving between tickets, reports, and conversations.

Sprint Progress Analyzer brings those facts into one view for engineering managers, delivery leads, and teams. Its intended outcome is a more focused conversation about scope and follow-up. This is a product hypothesis, not a claim of measured adoption or faster delivery.

## The scope decision

The first version accepts a Jira CSV export and runs in the browser. That makes it possible to try the tool without configuring credentials, an OAuth app, or a backend. A fictional sprint lets someone evaluate the interface before sharing any work data.

The tradeoff is important: a normal CSV is a snapshot, not a changelog. It cannot establish the original sprint commitment or when work was added and removed. The implementation initially reconstructed those fields to fit the model. The dashboard now explicitly marks those historical metrics as unavailable for imports and labels dates inferred from Updated as estimates. Showing that uncertainty is part of the product, because a precise-looking number can otherwise invite the wrong decision.

## How the product supports a decision

Progress against the original plan and progress against current scope are shown separately in the synthetic demo. A team can see why completed work alone does not explain a changing delivery picture. Blocked, aging, stale, and unestimated tickets provide starting points for discussion, with filters leading to the underlying issues.

The headline status reflects the most severe rule that fired. It does not predict a finish date or rate individual developers. A useful follow-up is a named dependency, decision, or scope adjustment agreed with the team.

## Engineering choices

Pure functions calculate the metrics, while an in-memory service owns the current dataset and notifies the UI after an import or reset. This keeps calculations directly testable and data loading separate from presentation. A service interface provides a boundary for future sources, but it does not make a live Jira integration trivial: authentication, pagination, changelogs, and historical estimate changes would still need deliberate work.

The interface uses ordinary React state, CSS progress bars, and a CSS timeline. That is enough for the current single-sprint workflow. Keeping the scope small leaves effort for trustworthy labels, error handling, keyboard access, and regression tests.

## Evidence and remaining uncertainty

The repository includes calculation and import tests, browser tests for the complete import/mapping/reset journey, and automated accessibility scans at desktop and phone widths in both themes. CI repeats the validation. [Performance measurements](performance.md) record synthetic input sizes and the environment rather than claiming a universal capacity limit. [Accessibility notes](accessibility.md) explain what was checked and what still needs human evaluation.

These checks demonstrate implementation behavior. They do not establish that teams find the tool useful. No customer interviews, adoption results, or delivery improvements are claimed.

## What I would validate next

Observe a few sprint reviews with prospective users. Ask which signals change the discussion, which labels cause confusion, and what evidence people need before acting. Check whether a CSV workflow is frequent enough to be useful or whether manual export is the main barrier. Use that evidence to decide whether to invest in changelog integration, better import guidance, or a narrower product.

I would defer forecasts and cross-team comparisons until the data can support them. Better historical inputs and clearer interpretation matter more than adding a more elaborate score.
