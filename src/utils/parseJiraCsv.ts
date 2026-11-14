import type { Assignee, Issue, IssueStatus } from '../types/jira';

/**
 * Parses a Jira issue-navigator CSV export into this app's Issue model.
 *
 * Jira's CSV export is a point-in-time snapshot of each issue, not a
 * changelog: it has no record of when an issue joined the sprint or when it
 * moved between statuses. Every issue is therefore treated as an original
 * commitment added at the sprint's start date, and its status history is
 * reconstructed as a single entry (current status, entered at "Updated" -
 * the closest available proxy for the last transition). Scope-change and
 * time-in-status figures built on this data are best-effort, not exact.
 */

const STATUS_ALIASES: Record<string, IssueStatus> = {
  'to do': 'To Do',
  open: 'To Do',
  backlog: 'To Do',
  'selected for development': 'To Do',
  'in progress': 'In Progress',
  'in development': 'In Progress',
  blocked: 'Blocked',
  impediment: 'Blocked',
  'on hold': 'Blocked',
  'in review': 'In Review',
  'code review': 'In Review',
  review: 'In Review',
  'in qa': 'In Review',
  qa: 'In Review',
  testing: 'In Review',
  done: 'Done',
  closed: 'Done',
  resolved: 'Done',
};

const HEADER_ALIASES: Record<string, string[]> = {
  key: ['issue key', 'key'],
  id: ['issue id', 'id'],
  summary: ['summary'],
  status: ['status'],
  assignee: ['assignee'],
  storyPoints: ['story points', 'story point estimate', 'custom field (story points)'],
  created: ['created'],
  updated: ['updated'],
};

export interface ParsedCsvResult {
  issues: Issue[];
  warnings: string[];
  /** Distinct raw status strings from the CSV that weren't recognized (defaulted to "To Do"). */
  unknownStatuses: string[];
}

export interface ImportSprintMeta {
  name: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  goal?: string;
}

/** Parses raw CSV text (RFC 4180: quoted fields, embedded commas/newlines/escaped quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function findColumn(headers: string[], names: string[]): number {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  for (const name of names) {
    const index = normalized.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}

function mapStatus(
  raw: string,
  customStatusMap: Record<string, IssueStatus>,
  unknownStatuses: Map<string, string>,
): IssueStatus {
  const key = raw.trim().toLowerCase();
  const mapped = customStatusMap[key] ?? STATUS_ALIASES[key];
  if (mapped) return mapped;
  if (!unknownStatuses.has(key)) {
    unknownStatuses.set(key, raw.trim());
  }
  return 'To Do';
}

/** Returns the parsed ISO date, or null when the value is empty or unreadable. */
function parseDate(raw: string | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** `invalid` is true when a non-empty value isn't a number (read as unestimated). */
function parseStoryPoints(raw: string | undefined): { value: number | null; invalid: boolean } {
  if (!raw || !raw.trim()) return { value: null, invalid: false };
  const value = Number(raw.trim());
  return Number.isFinite(value) ? { value, invalid: false } : { value: null, invalid: true };
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Converts a Jira CSV export into `Issue[]`. `sprintMeta.startDate` anchors
 * every issue's `addedToSprintAt` (see module docs for why). `customStatusMap`
 * lets a caller (e.g. a mapping form shown after unrecognized statuses turn
 * up) supply extra status-name -> IssueStatus mappings on top of the
 * built-in STATUS_ALIASES, for workflows with project-specific status names.
 */
export function parseJiraCsv(
  csvText: string,
  sprintMeta: ImportSprintMeta,
  customStatusMap: Record<string, IssueStatus> = {},
): ParsedCsvResult {
  const rows = parseCsv(csvText);
  const warnings: string[] = [];
  const normalizedCustomStatusMap = Object.fromEntries(
    Object.entries(customStatusMap).map(([raw, status]) => [raw.trim().toLowerCase(), status]),
  );

  if (rows.length === 0) {
    return { issues: [], warnings: ['CSV file is empty.'], unknownStatuses: [] };
  }

  const [headerRow, ...dataRows] = rows;
  const columns = Object.fromEntries(
    Object.entries(HEADER_ALIASES).map(([field, aliases]) => [field, findColumn(headerRow, aliases)]),
  );

  if (columns.key === -1) {
    return {
      issues: [],
      warnings: ['Could not find an "Issue key" column - is this a Jira issue export CSV?'],
      unknownStatuses: [],
    };
  }
  if (columns.status === -1) {
    warnings.push('No "Status" column found - all issues will default to "To Do".');
  }

  const unknownStatuses = new Map<string, string>();
  const seenKeys = new Set<string>();
  let duplicateRows = 0;
  let invalidStoryPoints = 0;
  let createdFallbacks = 0;
  let updatedFallbacks = 0;

  const issues: Issue[] = dataRows
    .map((row, rowIndex): Issue | null => {
      const key = row[columns.key]?.trim();
      if (!key) {
        warnings.push(`Row ${rowIndex + 2} has no Issue key - skipped.`);
        return null;
      }
      if (seenKeys.has(key)) {
        duplicateRows++;
        return null;
      }
      seenKeys.add(key);

      const id = columns.id !== -1 ? row[columns.id]?.trim() || key : key;
      const rawStatus = columns.status !== -1 ? row[columns.status]?.trim() || undefined : undefined;
      const status = columns.status !== -1
        ? mapStatus(row[columns.status] ?? '', normalizedCustomStatusMap, unknownStatuses)
        : 'To Do';
      let createdAt = sprintMeta.startDate;
      if (columns.created !== -1) {
        const parsed = parseDate(row[columns.created]);
        if (parsed) createdAt = parsed;
        else createdFallbacks++;
      }
      let updatedAt = createdAt;
      if (columns.updated !== -1) {
        const parsed = parseDate(row[columns.updated]);
        if (parsed) updatedAt = parsed;
        else updatedFallbacks++;
      }
      let storyPoints: number | null = null;
      if (columns.storyPoints !== -1) {
        const points = parseStoryPoints(row[columns.storyPoints]);
        storyPoints = points.value;
        if (points.invalid) invalidStoryPoints++;
      }
      const assigneeName = columns.assignee !== -1 ? row[columns.assignee]?.trim() : '';

      const assignee: Assignee | null = assigneeName
        ? { id: assigneeName, displayName: assigneeName }
        : null;

      return {
        id,
        key,
        summary: columns.summary !== -1 ? row[columns.summary]?.trim() || key : key,
        assignee,
        status,
        rawStatus,
        storyPoints,
        createdAt,
        lastUpdatedAt: updatedAt,
        addedToSprintAt: sprintMeta.startDate,
        wasOriginalCommitment: true,
        statusHistory: [{ status, enteredAt: updatedAt }],
      };
    })
    .filter((issue): issue is Issue => issue !== null);

  if (unknownStatuses.size > 0) {
    warnings.push(
      `${unknownStatuses.size} unrecognized status${unknownStatuses.size === 1 ? '' : 'es'} defaulted to "To Do": ${Array.from(unknownStatuses.values()).join(', ')}.`,
    );
  }
  if (duplicateRows > 0) {
    warnings.push(
      `${plural(duplicateRows, 'row')} repeated an issue key already in the file and ${duplicateRows === 1 ? 'was' : 'were'} dropped (the first row for each key was kept).`,
    );
  }
  if (invalidStoryPoints > 0) {
    warnings.push(
      `${plural(invalidStoryPoints, 'story point value')} ${invalidStoryPoints === 1 ? 'was' : 'were'} not a number and ${invalidStoryPoints === 1 ? 'was' : 'were'} read as unestimated.`,
    );
  }
  if (createdFallbacks > 0) {
    warnings.push(
      `${plural(createdFallbacks, '"Created" date')} ${createdFallbacks === 1 ? 'was' : 'were'} missing or unreadable and fell back to the sprint start date.`,
    );
  }
  if (updatedFallbacks > 0) {
    warnings.push(
      `${plural(updatedFallbacks, '"Updated" date')} ${updatedFallbacks === 1 ? 'was' : 'were'} missing or unreadable and fell back to the "Created" date.`,
    );
  }
  if (issues.length === 0) {
    warnings.push('No issues were imported.');
  }

  return { issues, warnings, unknownStatuses: Array.from(unknownStatuses.values()) };
}
