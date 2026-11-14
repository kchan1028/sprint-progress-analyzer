import { describe, expect, it } from 'vitest';
import { CsvJiraService } from '../services/jira/CsvJiraService';

const meta = { name: 'Example import', startDate: '2026-11-02', endDate: '2026-11-16' };

describe('sprint provenance lifecycle', () => {
  it('changes provenance only for successful imports and restores it on reset', async () => {
    const service = new CsvJiraService();
    expect((await service.getCurrentSprint()).source).toBe('demo');
    service.loadFromCsv('Summary\nMissing key', meta);
    expect((await service.getCurrentSprint()).source).toBe('demo');
    service.loadFromCsv('Issue key,Status\nEXAMPLE-1,Done', meta);
    const imported = await service.getCurrentSprint();
    expect(imported.source).toBe('csv');
    expect(await service.getSprintIssues(imported.id)).toHaveLength(1);
    service.loadFromCsv('', meta);
    expect((await service.getCurrentSprint()).id).toBe(imported.id);
    service.resetToDemoData();
    expect((await service.getCurrentSprint()).source).toBe('demo');
  });
});
