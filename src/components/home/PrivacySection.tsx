export function PrivacySection() {
  return (
    <section className="section-block section-block--narrow" id="privacy" aria-labelledby="privacy-heading">
      <div className="section-block__inner">
        <h2 id="privacy-heading" className="section-block__heading">Privacy &amp; Data Handling</h2>
        <p className="privacy-callout">Your Jira data stays with you.</p>
        <p className="section-block__lead">
          Sprint Progress Analyzer is designed as a local-first tool with no backend. It does not store
          your imported Jira data on our servers - your sprint data is processed and held locally in your
          browser, on your device.
        </p>
        <ul className="privacy-list">
          <li>Jira data is not uploaded to our servers - a CSV export is read and parsed entirely in your browser.</li>
          <li>
            Imported sprint data lives in your browser for your current session. Refreshing the page or
            closing the tab clears it, since it's held in memory rather than saved anywhere.
          </li>
          <li>
            Returning users don't have to redo everything from scratch: your light/dark theme preference and
            any Jira status-mapping corrections you've made are remembered locally, so the same status isn't
            asked about twice.
          </li>
          <li>
            You can clear your locally stored data at any time - use "Reset to demo data" or "Reset all
            saved mappings" in the import panel, or clear this site's data from your browser settings.
          </li>
        </ul>

        <p className="section-block__lead privacy-note--ads">
          This site may show ads served by Google AdSense. AdSense is a separate, third-party service that
          can process general browser and device information (such as your IP address or ad-interaction
          data) to select and measure ads - the same way most ad-supported sites work. It never receives
          your Jira data, ticket content, sprint information, uploaded files, or anything else stored
          locally in this app; that stays in your browser exactly as described above. You can review and
          adjust how Google uses ad data for you at{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            adssettings.google.com
          </a>
          .
        </p>

        <p className="section-block__lead privacy-note--ads">
          This site also uses Google Analytics to understand aggregate traffic, such as which pages are
          visited and roughly how, via cookies and similar technology. It never receives your Jira data,
          ticket content, sprint information, uploaded files, or anything else stored locally in this app.
          You can opt out using a browser extension such as the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            Google Analytics Opt-out Browser Add-on
          </a>
          .
        </p>
      </div>
    </section>
  );
}
