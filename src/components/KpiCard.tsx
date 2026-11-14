export type KpiTone = 'default' | 'warning' | 'danger';

interface KpiCardProps {
  label: string;
  value: number | null;
  context?: string;
  tone?: KpiTone;
}

/** Number first, label second, supporting context third - in that visual order. */
export function KpiCard({ label, value, context, tone = 'default' }: KpiCardProps) {
  return (
    <div className={`card kpi-card kpi-card--${tone}`}>
      <div className={`kpi-card__value ${value === null ? 'kpi-card__value--unavailable' : ''}`}>{value ?? 'Unavailable'}</div>
      <div className="kpi-card__label">{label}</div>
      {context && <div className="kpi-card__context">{context}</div>}
    </div>
  );
}
