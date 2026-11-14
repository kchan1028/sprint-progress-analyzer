import { KpiCard, type KpiTone } from './KpiCard';

export interface KpiValues {
  originalCommitment: number;
  currentScope: number;
  completed: number;
  remaining: number;
  inProgress: number;
  blocked: number;
  scopeAdded: number;
  scopeRemoved: number;
}

interface KpiCardSpec {
  label: string;
  value: number;
  context: string;
  tone?: KpiTone;
}

/** Presentational only - all figures are computed upstream by the calculation layer. */
export function KpiCards({ values }: { values: KpiValues }) {
  const cards: KpiCardSpec[] = [
    { label: 'Original Commitment', value: values.originalCommitment, context: 'story points at sprint start' },
    { label: 'Current Scope', value: values.currentScope, context: 'story points now in sprint' },
    { label: 'Completed', value: values.completed, context: 'story points done' },
    { label: 'Remaining', value: values.remaining, context: 'story points left' },
    { label: 'In Progress', value: values.inProgress, context: 'story points active' },
    {
      label: 'Blocked',
      value: values.blocked,
      context: values.blocked > 0 ? 'story points stuck' : 'story points blocked',
      tone: values.blocked > 0 ? 'danger' : 'default',
    },
    {
      label: 'Scope Added',
      value: values.scopeAdded,
      context: 'story points added mid-sprint',
      tone: values.scopeAdded > 0 ? 'warning' : 'default',
    },
    {
      label: 'Scope Removed',
      value: values.scopeRemoved,
      context: 'story points pulled out',
      tone: values.scopeRemoved > 0 ? 'warning' : 'default',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => (
        <KpiCard key={card.label} label={card.label} value={card.value} context={card.context} tone={card.tone} />
      ))}
    </div>
  );
}
