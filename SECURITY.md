# Security policy

## Scope and supported code

Security fixes target the latest code on `main`. Older commits and forks do not have a separate maintenance commitment. This is a portfolio project with no guaranteed response time, security certification, or bug bounty.

## Reporting a vulnerability

Do not post exploit details, credentials, real Jira exports, or personal information in public issues or pull requests.

GitHub private vulnerability reporting is currently disabled for this repository. To arrange a private report, [open an issue](https://github.com/kchan1028/sprint-progress-analyzer/issues/new) titled **Request for private security contact** with only a request for a private reporting channel. Wait for the maintainer to provide that channel before sharing technical details. If GitHub's **Report a vulnerability** option becomes available under the repository's Security tab, use it instead.

Once a private channel is established, include:

- The affected commit or version and how you run the app.
- A short explanation of the impact and steps to reproduce it.
- A minimal example using fictional tickets and people.
- Any suggested fix or workaround, if you have one.

Test only on your own local instance or systems where you have permission. Do not access other people's data or disrupt a deployed service to demonstrate a problem.

## Data handling and security boundaries

- CSV files are parsed in the browser. Imported tickets are held in memory and are cleared on refresh; the app has no application backend or direct Jira API connection.
- Theme preferences and status mappings persist in localStorage. Status names can reveal workflow details. Reset mappings in the import panel or clear the site's browser data when using a shared device.
- Local browser processing is not an isolation boundary against extensions, other scripts running on the same origin, or a compromised device. Use synthetic data when evaluating an unfamiliar deployment and follow your organization's rules before importing work data.
- Optional production Google Analytics sends page views, including URL and page title, when configured. Leave it unconfigured for a minimal setup and avoid sensitive information in URLs. Advertising script loading is currently disabled. Review third-party scripts before enabling them for sensitive workflows.
- The Vercel config sends a strict Content Security Policy and other security headers (see `vercel.json`). It blocks inline scripts other than the hashed theme script, and scripts from origins other than this site and Google Analytics. Other hosts need the same headers configured. Browser extensions are not limited by it.
- Every `VITE_*` value is public client configuration. Never put Jira tokens, passwords, private keys, or other secrets in those variables. Ignored environment files do not make values safe once bundled into the app.

CSV status history and scope-change figures are approximations, not an audit trail. See the [user guide](docs/user-guide.md#know-what-a-csv-cannot-tell-you) before relying on them for a decision.

## Running and maintaining a deployment

Keep the development and preview servers local; use a static host for production build output. Configure HTTPS and appropriate access restrictions on that host if the deployment requires them. The app itself does not implement sign-in or access control.

Before sharing changes, run the documented tests, lint, and production build in [setup.md](setup.md#check-your-changes). Review dependency advisories and lockfile changes; a clean dependency audit does not establish that the app is secure. Check exports, logs, screenshots, and configuration for private data before committing them.

If a credential is exposed, revoke or rotate it with its provider immediately. Removing it from the latest file does not remove copies in Git history or elsewhere. Coordinate any history cleanup with the maintainer rather than force-pushing.
