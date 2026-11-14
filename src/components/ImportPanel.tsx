import { useRef, useState } from 'react';
import { csvJiraService } from '../services/jira';
import type { IssueStatus } from '../types/jira';
import {
  forgetStatusMapping,
  loadSavedStatusMappings,
  resetStatusMappings,
  saveStatusMappings,
  toCustomStatusMap,
  type SavedStatusMappings,
} from '../utils/statusMappingStorage';

const STATUS_OPTIONS: IssueStatus[] = ['To Do', 'In Progress', 'In Review', 'Blocked', 'Done'];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function twoWeeksFromTodayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

/**
 * Lets the user upload a Jira issue-navigator CSV export (Jira: issue
 * search -> Export -> CSV) and swaps it in as the dashboard's data source.
 * Jira's export has no changelog, so sprint start/end dates are collected
 * here rather than read from the file - see parseJiraCsv.ts for how that
 * limits scope-change and time-in-status accuracy.
 *
 * Jira status names are project-specific (e.g. "Alpha Deployed", "Dev
 * Review"), so anything not covered by the built-in aliases is defaulted
 * to "To Do" and surfaced here as a mapping form the user can fill in and
 * re-import with. Every resolution (including untouched "To Do" defaults)
 * is remembered in localStorage (see statusMappingStorage.ts), so the same
 * raw status is never prompted for again on a later import or visit.
 */
export function ImportPanel({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [sprintName, setSprintName] = useState('Imported Sprint');
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(twoWeeksFromTodayIso());
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[] | null>(null);
  const [unknownStatuses, setUnknownStatuses] = useState<string[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, IssueStatus>>({});
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMappings, setSavedMappings] = useState<SavedStatusMappings>(() => loadSavedStatusMappings());
  const [showSavedMappings, setShowSavedMappings] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setFileName(file?.name ?? null);
    setCsvText(null);
    setWarnings(null);
    setUnknownStatuses([]);
    setStatusMap({});
    setStatus('idle');
  }

  /** Runs the parse/load against the service. Returns null (after setting an error) if the dates are invalid. */
  function runImport(text: string, customStatusMap: Record<string, IssueStatus>) {
    if (!startDate || !endDate || !Number.isFinite(Date.parse(startDate)) ||
      !Number.isFinite(Date.parse(endDate)) || new Date(endDate) <= new Date(startDate)) {
      setErrorMessage('Sprint end date must be after the start date.');
      setStatus('error');
      return null;
    }

    return csvJiraService.loadFromCsv(
      text,
      {
        name: sprintName.trim() || 'Imported Sprint',
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      },
      customStatusMap,
    );
  }

  function applyImportResult(parseWarnings: string[], unmapped: string[]) {
    setWarnings(parseWarnings);
    setUnknownStatuses(unmapped);
    const failed = parseWarnings.some((w) =>
      w.startsWith('No issues') || w.startsWith('CSV file is empty') || w.startsWith('Could not find'),
    );
    setErrorMessage(failed ? 'No issues imported. Check the CSV notes below.' : null);
    setStatus(failed ? 'error' : 'success');
  }

  async function handleImport() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setErrorMessage('Choose a CSV file first.');
      setStatus('error');
      return;
    }

    try {
      const text = await file.text();
      setCsvText(text);
      setStatusMap({});

      // Only statuses never seen before end up unmapped here - everything previously
      // saved (or built into the app) is applied automatically before results are shown.
      const result = runImport(text, toCustomStatusMap(savedMappings));
      if (!result) return;

      // Whatever's still unmapped just got defaulted to "To Do" by the parser -
      // persist that now so it's applied (not re-prompted) on the next import.
      if (result.unknownStatuses.length > 0) {
        const updated = saveStatusMappings(
          result.unknownStatuses.map((rawStatus) => ({ rawStatus, status: 'To Do' as IssueStatus })),
        );
        setSavedMappings(updated);
      }

      applyImportResult(result.warnings, result.unknownStatuses);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to read file.');
      setStatus('error');
    }
  }

  function handleReimportWithMapping() {
    if (!csvText) return;

    // Persist every status this form was resolving - including any left at their
    // default - BEFORE re-importing, so a correction actually overwrites what was
    // auto-saved on the first pass (re-running the parse alone can't do that, since
    // a fully-resolved re-import reports nothing as unmapped anymore).
    const updated = saveStatusMappings(
      unknownStatuses.map((rawStatus) => ({ rawStatus, status: statusMap[rawStatus] ?? 'To Do' })),
    );
    setSavedMappings(updated);

    const result = runImport(csvText, toCustomStatusMap(updated));
    if (!result) return;
    applyImportResult(result.warnings, result.unknownStatuses);
  }

  function handleReset() {
    csvJiraService.resetToDemoData();
    setFileName(null);
    setCsvText(null);
    setWarnings(null);
    setUnknownStatuses([]);
    setStatusMap({});
    setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleForgetSavedMapping(key: string) {
    setSavedMappings(forgetStatusMapping(key));
  }

  function handleUpdateSavedMapping(entry: SavedStatusMappings[string], nextStatus: IssueStatus) {
    setSavedMappings(saveStatusMappings([{ rawStatus: entry.rawStatus, status: nextStatus }]));
  }

  function handleResetSavedMappings() {
    setSavedMappings(resetStatusMappings());
  }

  const savedMappingEntries = Object.entries(savedMappings).sort(([, a], [, b]) =>
    a.rawStatus.localeCompare(b.rawStatus),
  );

  if (!open) {
    return (
      <div className="section">
        <button type="button" className="filter-button" onClick={() => setOpen(true)}>
          Import Jira CSV
        </button>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="card import-panel">
        <div className="import-panel__header">
          <h2 className="section__heading">Import from Jira CSV</h2>
          <button type="button" className="filter-button" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <p className="section__subheading">
          In Jira: open your board's backlog or an issue search for the sprint, then Export → CSV.
          The export has no changelog, so status-history and scope-change figures are approximated
          from "Updated" timestamps rather than exact - see the notes below after importing.
        </p>

        <div className="import-panel__fields">
          <label className="import-panel__field">
            Sprint name
            <input type="text" value={sprintName} onChange={(e) => setSprintName(e.target.value)} />
          </label>
          <label className="import-panel__field">
            Start date
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="import-panel__field">
            End date
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
          <label className="import-panel__field">
            CSV file
            <input type="file" accept=".csv,text/csv" ref={fileInputRef} onChange={handleFileChange} />
          </label>
        </div>

        <p className="import-panel__privacy-note">
          Your Jira data stays in your browser - we don't store your sprint data on our servers.
        </p>

        <div className="import-panel__actions">
          <button type="button" className="filter-button filter-button--active" onClick={handleImport}>
            Import{fileName ? ` "${fileName}"` : ''}
          </button>
          <button type="button" className="filter-button" onClick={handleReset}>
            Reset to demo data
          </button>
          <button type="button" className="filter-button" onClick={() => setShowSavedMappings((v) => !v)}>
            Saved Status Mappings ({savedMappingEntries.length})
          </button>
        </div>

        {status === 'success' && (
          <div className="signal signal--info" role="status">
            <span className="signal__icon">✓</span>
            <span>Imported successfully.{warnings && warnings.length > 0 ? ' See notes below.' : ''}</span>
          </div>
        )}
        {status === 'error' && errorMessage && (
          <div className="signal signal--warning" role="alert">
            <span className="signal__icon">!</span>
            <span>{errorMessage}</span>
          </div>
        )}
        {warnings && warnings.length > 0 && (
          <ul className="import-panel__warnings">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}

        {unknownStatuses.length > 0 && (
          <div className="import-panel__status-map">
            <p className="section__subheading">
              These statuses haven't been seen before, so they were defaulted to "To Do" and remembered.
              Correct them here and re-import to update the saved mapping:
            </p>
            {unknownStatuses.map((raw) => (
              <div className="import-panel__status-map-row" key={raw}>
                <span>{raw}</span>
                <select
                  aria-label={`Map status ${raw}`}
                  value={statusMap[raw] ?? 'To Do'}
                  onChange={(e) =>
                    setStatusMap((prev) => ({ ...prev, [raw]: e.target.value as IssueStatus }))
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              type="button"
              className="filter-button filter-button--active"
              onClick={handleReimportWithMapping}
            >
              Re-import with these mappings
            </button>
          </div>
        )}

        {showSavedMappings && (
          <div className="import-panel__status-map">
            <p className="section__subheading">
              Every status mapping resolved so far, saved in this browser. Applied automatically to future
              imports - edit or forget one below if it's wrong.
            </p>
            {savedMappingEntries.length === 0 ? (
              <p className="muted">No saved mappings yet - they'll appear here after your first import.</p>
            ) : (
              savedMappingEntries.map(([key, entry]) => (
                <div className="import-panel__status-map-row" key={key}>
                  <span>{entry.rawStatus}</span>
                  <div className="import-panel__status-map-row-actions">
                    <select
                      aria-label={`Saved mapping for ${entry.rawStatus}`}
                      value={entry.status}
                      onChange={(e) => handleUpdateSavedMapping(entry, e.target.value as IssueStatus)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="filter-button"
                      onClick={() => handleForgetSavedMapping(key)}
                    >
                      Forget
                    </button>
                  </div>
                </div>
              ))
            )}
            {savedMappingEntries.length > 0 && (
              <button type="button" className="filter-button" onClick={handleResetSavedMappings}>
                Reset all saved mappings
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
