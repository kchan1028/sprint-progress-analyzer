import { WORKFLOW_STAGE_LABEL, type WorkflowStageSummary } from '../utils/workflowStages';

function stageClass(stage: string): string {
  return stage.toLowerCase().replace(/[^a-z]+/g, '-');
}

/**
 * Leadership-facing delivery pipeline: where does the sprint's work
 * currently sit, from "not started" through "done" (plus "deleted" for
 * OBE'd tickets, shown apart since it's not part of the delivery flow).
 * Presentational only - stage assignment happens in workflowStages.ts.
 */
export function WorkflowPipeline({ stages }: { stages: WorkflowStageSummary[] }) {
  return (
    <div className="pipeline">
      {stages.map(({ stage, issues, storyPoints }) => (
        <div key={stage} className={`pipeline-stage pipeline-stage--${stageClass(stage)}`}>
          <div className="pipeline-stage__count">{issues.length}</div>
          <div className="pipeline-stage__label">{WORKFLOW_STAGE_LABEL[stage]}</div>
          <div className="pipeline-stage__points">{storyPoints} SP</div>

          {issues.length > 0 ? (
            <ul className="pipeline-stage__tickets" tabIndex={0} aria-label={`${WORKFLOW_STAGE_LABEL[stage]} tickets`}>
              {issues.map((issue) => (
                <li key={issue.id} className="pipeline-ticket" title={issue.summary}>
                  <span className="pipeline-ticket__key">{issue.key}</span>
                  <span className="pipeline-ticket__summary">{issue.summary}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="pipeline-stage__empty">No tickets</div>
          )}
        </div>
      ))}
    </div>
  );
}
