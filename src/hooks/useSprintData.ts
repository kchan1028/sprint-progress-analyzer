import { useEffect, useState } from 'react';
import type { Issue, Sprint } from '../types/jira';
import { jiraService } from '../services/jira';

interface SprintDataState {
  sprint: Sprint | null;
  issues: Issue[];
  loading: boolean;
  error: string | null;
}

/** Loads the current sprint and its issues from the configured JiraService. */
export function useSprintData(): SprintDataState {
  const [state, setState] = useState<SprintDataState>({
    sprint: null,
    issues: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const sprint = await jiraService.getCurrentSprint();
        const issues = await jiraService.getSprintIssues(sprint.id);
        if (!cancelled) {
          setState({ sprint, issues, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            sprint: null,
            issues: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load sprint data',
          });
        }
      }
    }

    load();
    const unsubscribe = jiraService.subscribe(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}
