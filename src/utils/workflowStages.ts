import type { Issue, IssueStatus } from '../types/jira';
import { isCurrentlyInSprint } from './sprintCalculations';

/**
 * Leadership-friendly delivery pipeline stages. Deliberately finer-grained
 * than `IssueStatus` (which only has 5 buckets and drives the rest of the
 * dashboard's math) - this exists purely to answer "where is the work right
 * now", using the *raw* Jira status text when it's available.
 *
 * 'Deleted' is not part of the linear delivery flow: it represents tickets
 * marked OBE (overtaken by events) - void, not delivered.
 */
export type WorkflowStage =
  | 'Not Started'
  | 'In Development'
  | 'Code Review'
  | 'Testing'
  | 'Blocked'
  | 'Done'
  | 'Deleted';

export const WORKFLOW_STAGES: WorkflowStage[] = [
  'Not Started',
  'In Development',
  'Code Review',
  'Testing',
  'Blocked',
  'Done',
  'Deleted',
];

export const WORKFLOW_STAGE_LABEL: Record<WorkflowStage, string> = {
  'Not Started': 'Not Started',
  'In Development': 'In Development',
  'Code Review': 'Code Review',
  Testing: 'Testing / QA',
  Blocked: 'Blocked',
  Done: 'Done',
  Deleted: 'Deleted (OBE)',
};

/** Raw Jira status text (lowercased) -> pipeline stage. Extend as new team-specific statuses turn up. */
const RAW_STATUS_TO_STAGE: Record<string, WorkflowStage> = {
  'to do': 'Not Started',
  open: 'Not Started',
  ready: 'Not Started',
  created: 'Not Started',
  'sprint planning': 'Not Started',
  'dev rereview': 'Not Started',
  'pm & design review': 'Not Started',
  'pm and design review': 'Not Started',
  backlog: 'Not Started',

  'in progress': 'In Development',
  development: 'In Development',
  'in development': 'In Development',

  'pull request': 'Code Review',
  'code review': 'Code Review',
  'peer review': 'Code Review',

  'ready for qa': 'Testing',
  qa: 'Testing',
  'in qa': 'Testing',
  testing: 'Testing',
  uat: 'Testing',
  'alpha deployed': 'Testing',

  blocked: 'Blocked',
  impediment: 'Blocked',
  'on hold': 'Blocked',

  done: 'Done',
  closed: 'Done',
  resolved: 'Done',
  released: 'Done',

  obe: 'Deleted',
};

/** Used when an issue has no raw Jira status text (e.g. demo data) - a coarser but sane default. */
const FALLBACK_FROM_ISSUE_STATUS: Record<IssueStatus, WorkflowStage> = {
  'To Do': 'Not Started',
  'In Progress': 'In Development',
  'In Review': 'Code Review',
  Blocked: 'Blocked',
  Done: 'Done',
};

export function getWorkflowStage(issue: Issue): WorkflowStage {
  const raw = issue.rawStatus?.trim().toLowerCase();
  if (raw && raw in RAW_STATUS_TO_STAGE) {
    return RAW_STATUS_TO_STAGE[raw];
  }
  return FALLBACK_FROM_ISSUE_STATUS[issue.status];
}

export interface WorkflowStageSummary {
  stage: WorkflowStage;
  issues: Issue[];
  storyPoints: number;
}

/**
 * Buckets every issue currently in the sprint into its delivery-pipeline
 * stage. Always returns one entry per WORKFLOW_STAGES, in order, even when
 * empty, so the full pipeline shape is visible at a glance.
 */
export function getWorkflowPipeline(issues: Issue[]): WorkflowStageSummary[] {
  const inSprint = issues.filter(isCurrentlyInSprint);
  const byStage = new Map<WorkflowStage, Issue[]>(WORKFLOW_STAGES.map((stage) => [stage, []]));

  for (const issue of inSprint) {
    byStage.get(getWorkflowStage(issue))!.push(issue);
  }

  return WORKFLOW_STAGES.map((stage) => {
    const stageIssues = byStage.get(stage)!;
    return {
      stage,
      issues: stageIssues,
      storyPoints: stageIssues.reduce((sum, issue) => sum + (issue.storyPoints ?? 0), 0),
    };
  });
}
