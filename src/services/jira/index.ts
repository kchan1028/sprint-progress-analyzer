import { CsvJiraService } from './CsvJiraService';

export type { JiraService } from './JiraService';

/**
 * Single point of configuration for which JiraService implementation the
 * app uses. CsvJiraService starts out serving the demo mock data and can be
 * repointed at a real Jira CSV export at runtime (see ImportPanel). Swap
 * this for `new JiraApiService(...)` once a live Jira connection exists -
 * nothing else in the app needs to change beyond that.
 */
export const csvJiraService = new CsvJiraService();
export const jiraService = csvJiraService;
