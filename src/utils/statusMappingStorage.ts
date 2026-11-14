import type { IssueStatus } from '../types/jira';

const STORAGE_KEY = 'sprint-analyzer-status-mappings';

/** One remembered resolution: the raw Jira status text (as first seen) and the IssueStatus it resolves to. */
export interface SavedStatusMapping {
  rawStatus: string;
  status: IssueStatus;
}

/** Keyed by the raw status text, lowercased and trimmed, for case-insensitive lookups. */
export type SavedStatusMappings = Record<string, SavedStatusMapping>;

function normalizeKey(rawStatus: string): string {
  return rawStatus.trim().toLowerCase();
}

function readAll(): SavedStatusMappings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(mappings: SavedStatusMappings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) - mappings just won't persist this session.
  }
}

/** Loads every status mapping the user has previously resolved, from localStorage. */
export function loadSavedStatusMappings(): SavedStatusMappings {
  return readAll();
}

/** Adds or overwrites mappings, merging with whatever's already saved. Returns the updated set. */
export function saveStatusMappings(entries: SavedStatusMapping[]): SavedStatusMappings {
  const current = readAll();
  for (const entry of entries) {
    const rawStatus = entry.rawStatus.trim();
    if (!rawStatus) continue;
    current[normalizeKey(rawStatus)] = { rawStatus, status: entry.status };
  }
  writeAll(current);
  return current;
}

/** Removes one saved mapping (by its normalized key) so it will be prompted for again next time it's seen. */
export function forgetStatusMapping(key: string): SavedStatusMappings {
  const current = readAll();
  delete current[key];
  writeAll(current);
  return current;
}

/** Clears every saved mapping. */
export function resetStatusMappings(): SavedStatusMappings {
  writeAll({});
  return {};
}

/** Converts saved mappings into the plain raw-status -> IssueStatus map parseJiraCsv's customStatusMap expects. */
export function toCustomStatusMap(saved: SavedStatusMappings): Record<string, IssueStatus> {
  const result: Record<string, IssueStatus> = {};
  for (const { rawStatus, status } of Object.values(saved)) {
    result[rawStatus] = status;
  }
  return result;
}
