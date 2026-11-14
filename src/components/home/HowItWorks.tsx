import { Link } from 'react-router-dom';

const STEPS = [
  {
    title: 'Export or provide your Jira sprint data',
    body: 'Export your current sprint as a CSV from Jira\'s issue navigator, or explore the tool first with realistic sample data. No Jira account connection or API access is needed for this.',
  },
  {
    title: 'Import the data into Sprint Progress Analyzer',
    body: 'Upload the CSV. It\'s parsed entirely in your browser, and Jira status names are normalized into leadership-friendly delivery stages automatically.',
  },
  {
    title: 'Review sprint health, delivery signals, bottlenecks, and risks',
    body: 'See scope changes, workflow bottlenecks, blocked work, and completion pace in one view built for a quick scan.',
  },
];

export function HowItWorks() {
  return (
    <section className="section-block" id="how-it-works" aria-labelledby="how-it-works-heading">
      <div className="section-block__inner">
        <h2 id="how-it-works-heading" className="section-block__heading">How It Works</h2>
        <div className="steps">
          {STEPS.map((step, index) => (
            <div className="step card" key={step.title}>
              <div className="step__number">{index + 1}</div>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__body">{step.body}</p>
            </div>
          ))}
        </div>
        <p className="how-it-works__privacy-note">
          Your Jira data stays in your browser - we don't store your sprint data on our servers.
        </p>
        <div className="section-block__cta">
          <Link to="/analyze" className="btn btn--primary">
            Analyze Your Sprint
          </Link>
        </div>
      </div>
    </section>
  );
}
