import { describe, expect, it } from 'vitest';
import { parseCsv, parseJiraCsv } from '../utils/parseJiraCsv';

const SPRINT_META = {
  name: 'Sprint 99',
  startDate: '2026-09-01T00:00:00.000Z',
  endDate: '2026-09-14T00:00:00.000Z',
};

describe('parseCsv', () => {
  it('splits plain rows on commas', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('handles quoted fields with embedded commas, newlines, and escaped quotes', () => {
    const csv = 'key,summary\nJIRA-1,"Fix ""login"" bug, urgently"\nJIRA-2,"Multi\nline summary"';
    expect(parseCsv(csv)).toEqual([
      ['key', 'summary'],
      ['JIRA-1', 'Fix "login" bug, urgently'],
      ['JIRA-2', 'Multi\nline summary'],
    ]);
  });
});

describe('parseJiraCsv', () => {
  it('maps a standard Jira export into Issue[]', () => {
    const csv = [
      'Issue key,Summary,Status,Assignee,Story Points,Created,Updated',
      'JIRA-1,Fix login bug,In Progress,Alice Chen,5,2026-08-30,2026-09-05',
      'JIRA-2,Write docs,To Do,,,2026-08-31,2026-08-31',
    ].join('\n');

    const { issues, warnings } = parseJiraCsv(csv, SPRINT_META);

    expect(warnings).toEqual([]);
    expect(issues).toHaveLength(2);

    expect(issues[0]).toMatchObject({
      key: 'JIRA-1',
      summary: 'Fix login bug',
      status: 'In Progress',
      rawStatus: 'In Progress',
      assignee: { displayName: 'Alice Chen' },
      storyPoints: 5,
      addedToSprintAt: SPRINT_META.startDate,
      wasOriginalCommitment: true,
    });
    expect(issues[0].statusHistory).toEqual([
      { status: 'In Progress', enteredAt: new Date('2026-09-05').toISOString() },
    ]);

    expect(issues[1].assignee).toBeNull();
    expect(issues[1].storyPoints).toBeNull();
  });

  it('maps common status aliases and warns on unrecognized ones', () => {
    const csv = [
      'Issue key,Status',
      'JIRA-1,Code Review',
      'JIRA-2,Closed',
      'JIRA-3,Some Custom Status',
    ].join('\n');

    const { issues, warnings, unknownStatuses } = parseJiraCsv(csv, SPRINT_META);

    expect(issues.map((i) => i.status)).toEqual(['In Review', 'Done', 'To Do']);
    expect(warnings.some((w) => w.includes('Some Custom Status'))).toBe(true);
    expect(unknownStatuses).toEqual(['Some Custom Status']);

    // rawStatus preserves the original text verbatim, independent of the normalized 5-bucket status.
    expect(issues.map((i) => i.rawStatus)).toEqual(['Code Review', 'Closed', 'Some Custom Status']);
  });

  it('applies a custom status map to resolve otherwise-unknown statuses', () => {
    const csv = ['Issue key,Status', 'JIRA-1,Alpha Deployed', 'JIRA-2,Dev Review'].join('\n');

    const withoutMap = parseJiraCsv(csv, SPRINT_META);
    expect(withoutMap.unknownStatuses).toEqual(['Alpha Deployed', 'Dev Review']);
    expect(withoutMap.issues.map((i) => i.status)).toEqual(['To Do', 'To Do']);

    const withMap = parseJiraCsv(csv, SPRINT_META, {
      'Alpha Deployed': 'Done',
      'dev review': 'In Review',
    });
    expect(withMap.unknownStatuses).toEqual([]);
    expect(withMap.issues.map((i) => i.status)).toEqual(['Done', 'In Review']);
  });

  it('skips rows with no issue key and reports when the key column is missing', () => {
    const missingKeyColumn = parseJiraCsv('Summary,Status\nfoo,To Do', SPRINT_META);
    expect(missingKeyColumn.issues).toEqual([]);
    expect(missingKeyColumn.warnings[0]).toMatch(/Issue key/);

    const blankKeyRow = parseJiraCsv('Issue key,Summary\n,foo\nJIRA-1,bar', SPRINT_META);
    expect(blankKeyRow.issues).toHaveLength(1);
    expect(blankKeyRow.issues[0].key).toBe('JIRA-1');
  });

  it('deduplicates repeated issue keys and warns with a count', () => {
    const csv = 'Issue key,Summary,Status\nJIRA-1,First,Done\nJIRA-1,Duplicate,Done\nJIRA-2,Other,Done\nJIRA-2,Again,Done';
    const { issues, warnings } = parseJiraCsv(csv, SPRINT_META);
    expect(issues).toHaveLength(2);
    expect(issues[0].summary).toBe('First');
    expect(warnings).toEqual([
      '2 rows repeated an issue key already in the file and were dropped (the first row for each key was kept).',
    ]);
  });

  it('warns with a count when story points are not numbers, but not when they are empty', () => {
    const csv = 'Issue key,Status,Story Points\nJIRA-1,Done,five\nJIRA-2,Done,\nJIRA-3,Done,3\nJIRA-4,Done,?';
    const { issues, warnings } = parseJiraCsv(csv, SPRINT_META);
    expect(issues.map((issue) => issue.storyPoints)).toEqual([null, null, 3, null]);
    expect(warnings).toEqual(['2 story point values were not a number and were read as unestimated.']);
  });

  it('warns with counts when Created or Updated dates fall back', () => {
    const csv = [
      'Issue key,Status,Created,Updated',
      'JIRA-1,Done,not a date,2026-09-03',
      'JIRA-2,Done,2026-09-02,',
      'JIRA-3,Done,2026-09-02,31/31/2026',
      'JIRA-4,Done,2026-09-02,2026-09-04',
    ].join('\n');
    const { issues, warnings } = parseJiraCsv(csv, SPRINT_META);
    expect(issues[0].createdAt).toBe(SPRINT_META.startDate);
    expect(issues[1].lastUpdatedAt).toBe(new Date('2026-09-02').toISOString());
    expect(warnings).toEqual([
      '1 "Created" date was missing or unreadable and fell back to the sprint start date.',
      '2 "Updated" dates were missing or unreadable and fell back to the "Created" date.',
    ]);
  });

  it('does not warn about dates or points when those columns are absent', () => {
    const { warnings } = parseJiraCsv('Issue key,Status\nJIRA-1,Done', SPRINT_META);
    expect(warnings).toEqual([]);
  });
});
