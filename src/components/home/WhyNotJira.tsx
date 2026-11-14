export function WhyNotJira() {
  return (
    <section className="section-block section-block--narrow" aria-labelledby="why-heading">
      <div className="section-block__inner">
        <h2 id="why-heading" className="section-block__heading">Why Not Just Use Jira?</h2>
        <p className="section-block__lead">
          Jira is excellent at what it's built for: tracking individual work items, their status, and their
          history. But answering "are we on track" usually means opening several tickets, filters, and
          reports, then mentally aggregating dozens of statuses and workflow states into one picture.
        </p>
        <p className="section-block__lead">
          Sprint Progress Analyzer is a complementary analysis layer on top of that data - it doesn't
          replace Jira as your system of record, it aggregates what's already in Jira into the concise view
          engineering leadership actually needs for a sprint-health conversation.
        </p>
      </div>
    </section>
  );
}
