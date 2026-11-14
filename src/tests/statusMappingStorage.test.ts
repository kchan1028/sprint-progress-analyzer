import { beforeEach, describe, expect, it } from 'vitest';
import {
  forgetStatusMapping,
  loadSavedStatusMappings,
  resetStatusMappings,
  saveStatusMappings,
  toCustomStatusMap,
} from '../utils/statusMappingStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('statusMappingStorage', () => {
  it('starts empty when nothing has been saved', () => {
    expect(loadSavedStatusMappings()).toEqual({});
  });

  it('saves mappings and reloads them (simulating a page refresh)', () => {
    saveStatusMappings([
      { rawStatus: 'Alpha Deployed', status: 'In Review' },
      { rawStatus: 'Sprint Planning', status: 'To Do' },
    ]);

    const reloaded = loadSavedStatusMappings();
    expect(Object.values(reloaded)).toHaveLength(2);
    expect(reloaded['alpha deployed']).toEqual({ rawStatus: 'Alpha Deployed', status: 'In Review' });
    expect(reloaded['sprint planning']).toEqual({ rawStatus: 'Sprint Planning', status: 'To Do' });
  });

  it('is case-insensitive - saving the same raw status in different casing overwrites, not duplicates', () => {
    saveStatusMappings([{ rawStatus: 'Alpha Deployed', status: 'To Do' }]);
    saveStatusMappings([{ rawStatus: 'alpha deployed', status: 'In Review' }]);

    const saved = loadSavedStatusMappings();
    expect(Object.keys(saved)).toEqual(['alpha deployed']);
    expect(saved['alpha deployed'].status).toBe('In Review');
  });

  it('merges new saves with what was already there instead of replacing the whole set', () => {
    saveStatusMappings([{ rawStatus: 'OBE', status: 'To Do' }]);
    saveStatusMappings([{ rawStatus: 'Dev Review', status: 'In Review' }]);

    const saved = loadSavedStatusMappings();
    expect(Object.keys(saved).sort()).toEqual(['dev review', 'obe']);
  });

  it('forgetStatusMapping removes a single entry, leaving the rest', () => {
    saveStatusMappings([
      { rawStatus: 'OBE', status: 'To Do' },
      { rawStatus: 'Dev Review', status: 'In Review' },
    ]);

    forgetStatusMapping('obe');

    const saved = loadSavedStatusMappings();
    expect(Object.keys(saved)).toEqual(['dev review']);
  });

  it('resetStatusMappings clears everything', () => {
    saveStatusMappings([{ rawStatus: 'OBE', status: 'To Do' }]);
    resetStatusMappings();
    expect(loadSavedStatusMappings()).toEqual({});
  });

  it('toCustomStatusMap converts saved mappings into a plain rawStatus -> IssueStatus record', () => {
    const saved = saveStatusMappings([
      { rawStatus: 'Alpha Deployed', status: 'In Review' },
      { rawStatus: 'OBE', status: 'To Do' },
    ]);

    expect(toCustomStatusMap(saved)).toEqual({
      'Alpha Deployed': 'In Review',
      OBE: 'To Do',
    });
  });

  it('survives a simulated reload by reading from the same underlying localStorage', () => {
    saveStatusMappings([{ rawStatus: 'Bugfix Backlog', status: 'To Do' }]);

    // Nothing in this module keeps state in memory between calls - every read goes
    // straight to localStorage, so this is exactly what happens after a page refresh.
    const afterReload = loadSavedStatusMappings();
    expect(afterReload['bugfix backlog']).toEqual({ rawStatus: 'Bugfix Backlog', status: 'To Do' });
  });
});
