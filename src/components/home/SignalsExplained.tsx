interface SignalExample {
  name: string;
  description: string;
}

const SIGNALS: SignalExample[] = [
  {
    name: 'Scope Growth',
    description:
      'The sprint has more work than the team originally committed to. Significant scope growth can make sprint completion less predictable.',
  },
  {
    name: 'Code Review Bottleneck',
    description:
      'A large amount of work is waiting for review, which may prevent otherwise completed development from reaching testing.',
  },
  {
    name: 'Testing Bottleneck',
    description:
      'Work is accumulating in QA/testing late in the sprint, increasing the risk that issues will not be validated before the sprint ends.',
  },
  {
    name: 'Completion Pace',
    description:
      'Compares elapsed sprint time with completed work to help determine whether delivery is progressing as expected.',
  },
  {
    name: 'Blocked Work',
    description:
      'Highlights work that cannot progress without resolving a dependency, technical issue, requirement, or external constraint.',
  },
];

export function SignalsExplained() {
  return (
    <section className="section-block" id="signals" aria-labelledby="signals-heading">
      <div className="section-block__inner">
        <h2 id="signals-heading" className="section-block__heading">What the Sprint Signals Mean</h2>
        <p className="section-block__lead">
          Each signal is a factual observation about the sprint, explained in plain language - not a single
          combined score.
        </p>

        <div className="signal-examples">
          {SIGNALS.map((signal) => (
            <div className="signal-example card" key={signal.name}>
              <h3 className="signal-example__name">{signal.name}</h3>
              <p className="signal-example__description">{signal.description}</p>
            </div>
          ))}
        </div>

        <p className="section-block__footnote">
          Sprint Progress Analyzer surfaces these signals and the data behind them - it does not predict
          sprint outcomes with certainty.
        </p>
      </div>
    </section>
  );
}
