function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value * 100)}%`;
}

interface ProgressMetricProps {
  label: string;
  value: number | null;
  formula: string;
  barValue?: number | null;
  emphasizePositive?: boolean;
  unavailable?: boolean;
}

function ProgressMetric({ label, value, formula, barValue, emphasizePositive, unavailable }: ProgressMetricProps) {
  const showPositive = emphasizePositive && value !== null && value > 0;
  return (
    <div className="card">
      <div className="progress-metric__header">
        <span className="progress-metric__label">{label}</span>
        <span className={`progress-metric__value ${showPositive ? 'progress-metric__value--positive' : ''} ${unavailable ? 'progress-metric__value--unavailable' : ''}`}>
          {value !== null && value > 0 && emphasizePositive ? '+' : ''}
          {unavailable ? 'Unavailable' : formatPercent(value)}
        </span>
      </div>
      {!unavailable && barValue !== undefined && (
        <div className="progress-bar">
          <div
            className="progress-bar__fill"
            style={{ width: `${Math.min(100, Math.max(0, (barValue ?? 0) * 100))}%` }}
          />
        </div>
      )}
      <div className="progress-metric__formula">{formula}</div>
    </div>
  );
}

interface ProgressSectionProps {
  commitmentProgress: number | null;
  currentScopeProgress: number | null;
  scopeChangePercent: number | null;
  historyAvailable?: boolean;
}

export function ProgressSection({
  commitmentProgress,
  currentScopeProgress,
  scopeChangePercent,
  historyAvailable = true,
}: ProgressSectionProps) {
  return (
    <div className="progress-grid">
      <ProgressMetric
        label="Commitment Progress"
        unavailable={!historyAvailable}
        value={commitmentProgress}
        barValue={commitmentProgress}
        formula={historyAvailable ? 'completed SP / original committed SP' : 'Original commitment is absent from CSV exports'}
      />
      <ProgressMetric
        label="Current Scope Progress"
        value={currentScopeProgress}
        barValue={currentScopeProgress}
        formula="completed SP / current sprint SP"
      />
      <ProgressMetric
        label="Scope Change"
        unavailable={!historyAvailable}
        value={scopeChangePercent}
        emphasizePositive
        formula={historyAvailable ? '(current scope − original commitment) / original commitment' : 'Scope history is absent from CSV exports'}
      />
    </div>
  );
}
