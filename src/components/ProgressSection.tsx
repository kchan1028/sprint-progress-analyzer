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
}

function ProgressMetric({ label, value, formula, barValue, emphasizePositive }: ProgressMetricProps) {
  const showPositive = emphasizePositive && value !== null && value > 0;
  return (
    <div className="card">
      <div className="progress-metric__header">
        <span className="progress-metric__label">{label}</span>
        <span className={`progress-metric__value ${showPositive ? 'progress-metric__value--positive' : ''}`}>
          {value !== null && value > 0 && emphasizePositive ? '+' : ''}
          {formatPercent(value)}
        </span>
      </div>
      {barValue !== undefined && (
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
}

export function ProgressSection({
  commitmentProgress,
  currentScopeProgress,
  scopeChangePercent,
}: ProgressSectionProps) {
  return (
    <div className="progress-grid">
      <ProgressMetric
        label="Commitment Progress"
        value={commitmentProgress}
        barValue={commitmentProgress}
        formula="completed SP / original committed SP"
      />
      <ProgressMetric
        label="Current Scope Progress"
        value={currentScopeProgress}
        barValue={currentScopeProgress}
        formula="completed SP / current sprint SP"
      />
      <ProgressMetric
        label="Scope Change"
        value={scopeChangePercent}
        emphasizePositive
        formula="(current scope − original commitment) / original commitment"
      />
    </div>
  );
}
