import { useMemo } from 'react';
import { useSprintData } from '../hooks/useSprintData';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { AdSense } from '../components/AdSense';
import { ImportPanel } from '../components/ImportPanel';
import { SprintHeader } from '../components/SprintHeader';
import { KpiCards } from '../components/KpiCards';
import { ProgressSection } from '../components/ProgressSection';
import { SprintSignals } from '../components/SprintSignals';
import { SprintTimeline } from '../components/SprintTimeline';
import { ScopeChangesTable } from '../components/ScopeChangesTable';
import { CurrentWorkTable, type CurrentWorkRow } from '../components/CurrentWorkTable';
import { WorkflowPipeline } from '../components/WorkflowPipeline';
import { getWorkflowPipeline } from '../utils/workflowStages';
import {
  getAgingInProgressIssues,
  getBlockedIssues,
  getBlockedPoints,
  getCommitmentProgress,
  getCompletedPoints,
  getCompletionEvents,
  getCurrentScope,
  getCurrentScopeProgress,
  getDaysElapsed,
  getDaysInCurrentStatus,
  getDaysRemaining,
  getInProgressPoints,
  getOriginalCommitment,
  getOverallSprintStatus,
  getRemainingPoints,
  getScopeAdded,
  getScopeChangePercent,
  getScopeChanges,
  getScopeRemoved,
  getSprintSignals,
  getStaleIssues,
  getUnestimatedIssues,
  isCurrentlyInSprint,
} from '../utils/sprintCalculations';
import type { IssueStatus } from '../types/jira';

const STATUS_ORDER: Record<IssueStatus, number> = {
  Blocked: 0,
  'In Progress': 1,
  'In Review': 2,
  'To Do': 3,
  Done: 4,
};

interface DashboardPageProps {
  /** Opens the import panel by default - used by the /analyze route. */
  defaultImportOpen?: boolean;
  pageTitle?: string;
}

export function DashboardPage({ defaultImportOpen = false, pageTitle }: DashboardPageProps) {
  const { sprint, issues, loading, error } = useSprintData();
  const now = useMemo(() => new Date(), []);

  useDocumentMeta({
    title: pageTitle ?? 'Sprint Progress Analyzer',
    description: 'Analyze your current Jira sprint: progress, scope changes, workflow bottlenecks, and delivery risk.',
  });

  const workRows: CurrentWorkRow[] = useMemo(() => {
    if (!sprint) return [];
    const blockedIds = new Set(getBlockedIssues(issues).map((issue) => issue.id));
    const agingIds = new Set(getAgingInProgressIssues(issues, now).map((issue) => issue.id));
    const staleIds = new Set(getStaleIssues(issues, now).map((issue) => issue.id));
    const unestimatedIds = new Set(getUnestimatedIssues(issues).map((issue) => issue.id));

    return issues
      .filter(isCurrentlyInSprint)
      .map((issue) => ({
        issue,
        daysInStatus: getDaysInCurrentStatus(issue, now),
        isBlocked: blockedIds.has(issue.id),
        isAging: agingIds.has(issue.id),
        isStale: staleIds.has(issue.id),
        isUnestimated: unestimatedIds.has(issue.id),
      }))
      .sort((a, b) => STATUS_ORDER[a.issue.status] - STATUS_ORDER[b.issue.status]);
  }, [issues, sprint, now]);

  if (loading) {
    return (
      <div>
        <ImportPanel defaultOpen={defaultImportOpen} />
        <div className="state-message">Loading current sprint…</div>
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div>
        <ImportPanel defaultOpen={defaultImportOpen} />
        <div className="state-message state-message--error">{error ?? 'Sprint not found.'}</div>
      </div>
    );
  }

  const signals = getSprintSignals(sprint, issues, now);
  const overallStatus = getOverallSprintStatus(signals);

  return (
    <div>
      <ImportPanel defaultOpen={defaultImportOpen} />

      {/* 1. Sprint identity + timeline dates, 2. overall health at a glance */}
      <SprintHeader
        sprint={sprint}
        status={overallStatus}
        daysElapsed={getDaysElapsed(sprint, now)}
        daysRemaining={getDaysRemaining(sprint, now)}
      />

      {/* 3. Key KPI metrics */}
      <div className="section">
        <KpiCards
          values={{
            originalCommitment: getOriginalCommitment(issues),
            currentScope: getCurrentScope(issues),
            completed: getCompletedPoints(issues),
            remaining: getRemainingPoints(issues),
            inProgress: getInProgressPoints(issues),
            blocked: getBlockedPoints(issues),
            scopeAdded: getScopeAdded(issues, sprint),
            scopeRemoved: getScopeRemoved(issues),
          }}
        />
      </div>

      {/* 4. Sprint progress */}
      <div className="section">
        <h2 className="section__heading">Progress</h2>
        <ProgressSection
          commitmentProgress={getCommitmentProgress(issues)}
          currentScopeProgress={getCurrentScopeProgress(issues)}
          scopeChangePercent={getScopeChangePercent(issues)}
        />
      </div>

      {/* Sprint Workflow / Delivery Pipeline - where the work currently sits */}
      <div className="section">
        <h2 className="section__heading">Sprint Workflow</h2>
        <p className="section__subheading">
          Leadership-friendly delivery stages, normalized from Jira's raw statuses.
        </p>
        <WorkflowPipeline stages={getWorkflowPipeline(issues)} />
      </div>

      {/* 5. Sprint signals / risks */}
      <div className="section">
        <h2 className="section__heading">Sprint Signals</h2>
        <SprintSignals signals={signals} />
      </div>

      {/* 6. Issues requiring attention */}
      <div className="section">
        <h2 className="section__heading">Issues Requiring Attention</h2>
        <p className="section__subheading">
          Sorted by risk: blocked, then in progress, in review, to do, done.
        </p>
        <CurrentWorkTable rows={workRows} />
      </div>

      {/* 7. Supporting details */}
      <div className="section section--supporting">
        <h2 className="section__heading section__heading--muted">Supporting Details</h2>

        <h3 className="section__subheading-title">Sprint Timeline</h3>
        <SprintTimeline
          sprint={sprint}
          now={now}
          originalCommitment={getOriginalCommitment(issues)}
          currentScope={getCurrentScope(issues)}
          completedPoints={getCompletedPoints(issues)}
          scopeChanges={getScopeChanges(issues, sprint)}
          completionEvents={getCompletionEvents(issues)}
        />

        <h3 className="section__subheading-title">Scope Changes</h3>
        <ScopeChangesTable changes={getScopeChanges(issues, sprint)} />
      </div>

      {/* Below all dashboard content - never between KPIs, signals, or tables. */}
      <div className="section">
        <AdSense slot={import.meta.env.VITE_ADSENSE_SLOT_DASHBOARD} />
      </div>
    </div>
  );
}
