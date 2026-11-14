import type { SprintSignal } from '../utils/sprintCalculations';

const SEVERITY_ICON: Record<SprintSignal['severity'], string> = {
  critical: '⛔',
  warning: '⚠',
  info: 'ℹ',
};

/** Text label alongside the icon so severity never depends on color alone. */
const SEVERITY_LABEL: Record<SprintSignal['severity'], string> = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'On Track',
};

export function SprintSignals({ signals }: { signals: SprintSignal[] }) {
  if (signals.length === 0) {
    return (
      <div className="card signals-empty">
        <span aria-hidden="true">✓</span> No risk signals detected.
      </div>
    );
  }

  return (
    <div className="card">
      <ul className="signals-list">
        {signals.map((signal) => (
          <li key={signal.id} className={`signal signal--${signal.severity}`}>
            <span className="signal__icon" aria-hidden="true">
              {SEVERITY_ICON[signal.severity]}
            </span>
            <div className="signal__body">
              <div className="signal__top-row">
                <span className="signal__severity-tag">{SEVERITY_LABEL[signal.severity]}</span>
                <span className="signal__headline">{signal.message}</span>
              </div>
              <dl className="signal__details">
                <dt>What it measures</dt>
                <dd>{signal.explanation}</dd>
                <dt>Why it matters</dt>
                <dd>{signal.whyItMatters}</dd>
                <dt>Green / Yellow / Red</dt>
                <dd>{signal.thresholdLegend}</dd>
                <dt>Watch for</dt>
                <dd>{signal.watchFor}</dd>
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
