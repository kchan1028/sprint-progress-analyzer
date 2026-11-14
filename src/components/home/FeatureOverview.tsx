interface FeatureGroup {
  title: string;
  items: string[];
  why: string;
}

const GROUPS: FeatureGroup[] = [
  {
    title: 'Commitment & Scope',
    items: ['Original sprint commitment', 'Current scope', 'Scope added or removed during the sprint'],
    why: 'Scope drift is one of the most common, least visible threats to sprint predictability. Seeing what changed since day one - not just where things stand today - is what makes a completion percentage trustworthy.',
  },
  {
    title: 'Where Work Actually Sits',
    items: [
      'Completed work',
      'Remaining work',
      'Work in development',
      'Work in code review',
      'Work in testing',
      'Blocked work',
    ],
    why: "A single \"in progress\" bucket hides where work really is. Knowing whether the sprint's remaining points are stuck in code review versus not yet started points to a different action today.",
  },
  {
    title: 'Completion & Risk',
    items: ['Sprint completion percentage', 'Delivery risk signals', 'Workflow bottlenecks'],
    why: 'Comparing completion pace against elapsed time is what turns a static status report into an early warning - the difference between finding out the sprint is at risk on day three versus the last day.',
  },
  {
    title: 'Data You Can Trust',
    items: ['Unrecognized Jira statuses'],
    why: "Leadership numbers are only as good as the status mapping behind them. Rather than silently guessing, unrecognized statuses are surfaced explicitly so you know what's been normalized and what hasn't.",
  },
];

export function FeatureOverview() {
  return (
    <section className="section-block" aria-labelledby="what-is-heading">
      <div className="section-block__inner">
        <h2 id="what-is-heading" className="section-block__heading">What is Sprint Progress Analyzer?</h2>
        <p className="section-block__lead">
          Sprint Progress Analyzer reads your Jira sprint data and gives engineering leadership an easier
          way to understand what's really happening in the sprint - not just a longer list of tickets.
        </p>

        <div className="feature-groups">
          {GROUPS.map((group) => (
            <div className="feature-group card" key={group.title}>
              <h3 className="feature-group__title">{group.title}</h3>
              <ul className="feature-group__items">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="feature-group__why">{group.why}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
