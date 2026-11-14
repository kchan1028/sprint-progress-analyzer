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
  value: number | null;
  context: string;
  tone?: KpiTone;
}

/** Presentational only - all figures are computed upstream by the calculation layer. */
export function KpiCards({ values, historyAvailable = true }: { values: KpiValues; historyAvailable?: boolean }) {
  const cards: KpiCardSpec[] = [
    { label: 'Original Commitment', value: historyAvailable ? values.originalCommitment : null, context: historyAvailable ? 'story points at sprint start' : 'CSV has no sprint-start history' },
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
      value: historyAvailable ? values.scopeAdded : null,
      context: historyAvailable ? 'story points added mid-sprint' : 'CSV has no scope-change history',
      tone: values.scopeAdded > 0 ? 'warning' : 'default',
    },
    {
      label: 'Scope Removed',
      value: historyAvailable ? values.scopeRemoved : null,
      context: historyAvailable ? 'story points pulled out' : 'CSV has no scope-change history',
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
