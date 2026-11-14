interface Audience {
  role: string;
  use: string;
}

const AUDIENCES: Audience[] = [
  {
    role: 'Engineering Leaders',
    use: 'Get a fast, factual read on delivery health across a sprint without reading every ticket, so status conversations start from data instead of a gut feeling.',
  },
  {
    role: 'Engineering Managers',
    use: 'See where work is actually stuck - code review, testing, or blocked - so coaching and unblocking effort goes where it matters this week.',
  },
  {
    role: 'Technical Leads',
    use: 'Spot workflow bottlenecks like a code-review backlog before they turn into a last-day scramble to get everything merged and tested.',
  },
  {
    role: 'Product Managers',
    use: 'Understand how scope changes mid-sprint are affecting the odds of hitting the sprint goal, and have that conversation earlier.',
  },
  {
    role: 'Scrum Masters',
    use: 'Bring objective, sprint-wide signals into standups and retros instead of manually cross-referencing the board every morning.',
  },
  {
    role: 'Software Development Teams',
    use: "See the team's own sprint the way leadership sees it, and use the same signals to flag risk before it's asked about.",
  },
];

export function AudienceSection() {
  return (
    <section className="section-block" id="who-its-for" aria-labelledby="audience-heading">
      <div className="section-block__inner">
        <h2 id="audience-heading" className="section-block__heading">Who Is This For?</h2>
        <div className="audience-grid">
          {AUDIENCES.map((a) => (
            <div className="audience-card card" key={a.role}>
              <h3 className="audience-card__role">{a.role}</h3>
              <p className="audience-card__use">{a.use}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
