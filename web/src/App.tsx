import { useState, type ChangeEvent } from 'react';
import {
  ArrowLeft,
  ArrowUpFromLine,
  Check,
  ChevronRight,
  CircleAlert,
  FileText,
  Info,
  LoaderCircle,
} from 'lucide-react';

import { CHANNEL_CONFIG, channelLabel } from '../../src/data/channelConfig';
import { CaptureValidationError, prepareCaptureFiles, runReconciliation } from '../../src/services/reconciliationService';
import type { Defect, DefectStatus, ReconciliationReport, ValidationIssue, ChannelType } from '../../src/types/reconciliation';

type Screen = 'issues' | 'import' | 'error' | 'detail' | 'validating' | 'running' | 'margins' | 'ingredients';
type SelectedFiles = Partial<Record<ChannelType, File>>;

const defectNames: Record<Defect['defectType'], string> = {
  MISSING_LISTING: 'Missing listing',
  PRICE_MISMATCH: 'Price mismatch',
  DESCRIPTION_MISMATCH: 'Description mismatch',
  ADD_ON_MISMATCH: 'Add-on mismatch',
  AVAILABILITY_MISMATCH: 'Availability mismatch',
};

function App() {
  const [screen, setScreen] = useState<Screen>('issues');
  const [files, setFiles] = useState<SelectedFiles>({});
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [activeDefectId, setActiveDefectId] = useState<string | null>(null);

  const selectedChannels = CHANNEL_CONFIG.filter(({ id }) => files[id]);
  const activeDefect = report?.defects.find(({ id }) => id === activeDefectId);
  const openDefectCount = report?.defects.filter(({ status }) => status === 'open').length ?? 0;

  function selectFile(channel: ChannelType, event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setFiles((current) => ({ ...current, [channel]: file }));
      setValidationIssues([]);
    }
    event.currentTarget.value = '';
  }

  async function validateAndReconcile() {
    if (selectedChannels.length === 0) return;
    setValidationIssues([]);
    setScreen('validating');

    try {
      const fileTexts = await Promise.all(selectedChannels.map(async ({ id }) => ({
        expectedChannel: id,
        fileName: files[id]!.name,
        text: await files[id]!.text(),
      })));
      const captures = prepareCaptureFiles(fileTexts);
      setScreen('running');
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const nextReport = runReconciliation(captures);
      setReport(nextReport);
      setScreen('issues');
    } catch (error) {
      if (error instanceof CaptureValidationError) {
        setValidationIssues(error.issues);
      } else {
        setValidationIssues([{
          fileName: selectedChannels[0]?.name ?? 'Selected files',
          expectedChannel: selectedChannels[0]?.id ?? 'COUNTER',
          field: 'file',
          reason: error instanceof Error ? error.message : 'Could not read this file.',
        }]);
      }
      setScreen('error');
    }
  }

  function replaceFile(channel: ChannelType) {
    setFiles((current) => ({ ...current, [channel]: undefined }));
    setScreen('import');
  }

  function updateDefectStatus(defectId: string, status: Exclude<DefectStatus, 'open'>) {
    setReport((current) => {
      if (!current) return current;
      const defects = current.defects.map((defect) => defect.id === defectId ? { ...defect, status } : defect);
      return {
        ...current,
        defects,
        summary: { ...current.summary, open: defects.filter(({ status: value }) => value === 'open').length },
      };
    });
    setScreen('issues');
  }

  const navTab = (name: 'issues' | 'margins' | 'ingredients') => {
    setScreen(name);
    setActiveDefectId(null);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark">MISE</span>
          <span className="brand-divider" />
          <span className="venue-name">Noelle&apos;s Cafe</span>
        </div>
        <span className="header-context">MENU REVIEW</span>
      </header>

      <main className="screen-content">
        {screen === 'issues' && (
          <section aria-labelledby="issues-heading">
            <div className="screen-heading dashboard-heading">
              <div>
                <span className="eyebrow">MENU RECONCILIATION</span>
                <h1 id="issues-heading">Issues</h1>
                {report ? <p className="subtitle">{openDefectCount} issues need attention</p> : null}
              </div>
              <button className="button button-outline import-action" onClick={() => setScreen('import')}>
                <ArrowUpFromLine aria-hidden="true" size={15} strokeWidth={2} />
                Import CSV
              </button>
            </div>

            {!report ? (
              <div className="empty-state">
                <span className="empty-icon"><FileText aria-hidden="true" size={23} strokeWidth={1.6} /></span>
                <h2>No reconciliation report yet</h2>
                <p>Import one or more menu capture CSV files to identify inconsistencies across the selected channels.</p>
                <button className="button button-primary" onClick={() => setScreen('import')}>
                  <ArrowUpFromLine aria-hidden="true" size={15} /> Import CSV
                </button>
              </div>
            ) : (
              <>
                <div className="report-summary">
                  <div className="summary-count">
                    <span className="summary-label">OPEN DEFECTS</span>
                    <strong>{openDefectCount}</strong>
                  </div>
                  <div className="severity-counts">
                    <span className="severity-count high">{report.summary.high} high</span>
                    <span className="severity-count medium">{report.summary.medium} medium</span>
                    <span className="severity-count low">{report.summary.low} low</span>
                  </div>
                </div>
                <div className="report-meta">
                  <div className="record-counts">
                    {CHANNEL_CONFIG.filter(({ id }) => report.recordCounts[id] > 0).map(({ id, fileLabel }) => (
                      <span key={id}>{fileLabel} <strong>{report.recordCounts[id]}</strong></span>
                    ))}
                  </div>
                </div>
                {selectedChannels.length < CHANNEL_CONFIG.length ? (
                  <p className="partial-note"><Info size={14} /> Partial comparison: missing-listing detection requires all three channel files.</p>
                ) : null}
                <h2 className="section-title">RECONCILIATION RESULTS</h2>
                {report.defects.length === 0 ? (
                  <div className="no-defects"><Check size={17} /> No inconsistencies found in the imported files.</div>
                ) : (
                  <div className="defect-list">
                    {report.defects.map((defect) => (
                      <button
                        className={`defect-card ${defect.status !== 'open' ? 'defect-resolved' : ''}`}
                        key={defect.id}
                        onClick={() => { setActiveDefectId(defect.id); setScreen('detail'); }}
                      >
                        <span className={`severity-marker severity-${defect.severity}`} />
                        <span className="defect-copy">
                          <span className="defect-topline">
                            <span className="defect-heading">{defectNames[defect.defectType]}</span>
                            <span className={`severity-badge severity-badge-${defect.severity}`}>{defect.severity}</span>
                          </span>
                          <span className="defect-item">
                            {defect.menuItemName}{defect.sizeName ? <span className="size-name"> · {defect.sizeName}</span> : null}
                          </span>
                          <span className="channel-chips">
                            {defect.affectedChannels.map((channel) => <span key={channel}>{channel}</span>)}
                          </span>
                          <span className="defect-message">{defect.message}</span>
                          {defect.status !== 'open' ? <span className="resolved-label">{defect.status}</span> : null}
                        </span>
                        <ChevronRight aria-hidden="true" className="defect-chevron" size={18} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {screen === 'import' && (
          <section aria-labelledby="import-heading">
            <button className="back-link" onClick={() => setScreen('issues')}><ArrowLeft size={15} /> Issues</button>
            <span className="eyebrow">CAPTURE MENU DATA</span>
            <h1 id="import-heading">Import menu captures</h1>
            <p className="subtitle import-subtitle">Upload the latest CSV export from each channel.</p>
            <div className="upload-list">
              {CHANNEL_CONFIG.map(({ id, name }) => {
                const file = files[id];
                return (
                  <div className={`upload-row ${file ? 'upload-row-ready' : ''}`} key={id}>
                    <span className="file-icon"><FileText size={21} strokeWidth={1.6} /></span>
                    <span className="upload-copy">
                      <span className="upload-name">{name}</span>
                      <span className="file-name" title={file?.name}>{file?.name ?? 'Choose CSV file'}</span>
                    </span>
                    {file ? (
                      <span className="ready-status"><Check size={14} /> Ready</span>
                    ) : (
                      <label className="button button-small button-teal file-picker">
                        Choose file
                        <input type="file" accept=".csv,text/csv" aria-label={`Choose ${name} CSV`} onChange={(event) => selectFile(id, event)} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="import-info"><Info size={15} /><span>One CSV per channel is recommended. Select at least one file for a partial comparison. Files stay in browser memory only.</span></div>
            <button className="button button-primary full-button" disabled={selectedChannels.length === 0} onClick={validateAndReconcile}>
              Validate &amp; reconcile <ChevronRight size={15} />
            </button>
          </section>
        )}

        {screen === 'error' && (
          <section aria-labelledby="error-heading">
            <button className="back-link" onClick={() => setScreen('import')}><ArrowLeft size={15} /> Import files</button>
            <span className="eyebrow">VALIDATION</span>
            <h1 id="error-heading">File needs attention</h1>
            <div className="validation-errors">
              {validationIssues.map((issue, index) => (
                <div className="validation-error" key={`${issue.fileName}-${issue.field}-${index}`}>
                  <CircleAlert size={16} />
                  <div>
                    <strong>{issue.fileName || 'Selected files'} · {issue.field}{issue.row ? ` · row ${issue.row}` : ''}</strong>
                    <p>{issue.reason}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="replace-list">
              {[...new Set(validationIssues.map(({ expectedChannel }) => expectedChannel))].map((channel) => (
                <button className="button button-primary" key={channel} onClick={() => replaceFile(channel)}>
                  Replace {channelLabel(channel)} CSV
                </button>
              ))}
            </div>
          </section>
        )}

        {(screen === 'validating' || screen === 'running') && (
          <section className="loading-state" aria-live="polite">
            <LoaderCircle className="loading-icon" size={36} />
            <h1>{screen === 'validating' ? 'Validating files…' : 'Running reconciliation…'}</h1>
            <p>{screen === 'validating' ? 'Checking CSV structure and channel data.' : 'Comparing imported menu listings in this browser.'}</p>
          </section>
        )}

        {screen === 'detail' && activeDefect && (
          <section aria-labelledby="detail-heading">
            <button className="back-link" onClick={() => setScreen('issues')}><ArrowLeft size={15} /> Issues</button>
            <div className="detail-heading-row">
              <div>
                <span className="eyebrow">{activeDefect.defectType.replaceAll('_', ' ')}</span>
                <h1 id="detail-heading">{activeDefect.menuItemName}</h1>
                {activeDefect.sizeName ? <p className="subtitle">{activeDefect.sizeName}</p> : null}
              </div>
              <span className={`severity-badge severity-badge-${activeDefect.severity}`}>{activeDefect.severity}</span>
            </div>
            <h2 className="section-title detail-section-title">{defectNames[activeDefect.defectType]}</h2>
            <div className="evidence-table">
              {CHANNEL_CONFIG.map(({ id, fileLabel }) => {
                const evidence = activeDefect.evidence[id];
                return (
                  <div className={`evidence-row ${evidence ? '' : 'evidence-missing'}`} key={id}>
                    <span className="evidence-channel">{fileLabel}</span>
                    {evidence ? (
                      <span className="evidence-values">
                        <strong>${evidence.price.toFixed(2)}</strong>
                        <span>{evidence.available ? 'Available' : 'Unavailable'}</span>
                        <span>{evidence.listingDescription || 'No description'}</span>
                        <span>Add-ons: {evidence.addOns || 'None'}</span>
                      </span>
                    ) : <span className="missing-value">Not listed in this capture</span>}
                  </div>
                );
              })}
            </div>
            <div className="detail-message"><Info size={16} /><p>{activeDefect.message}</p></div>
            <div className="detail-actions">
              <button className="button button-primary" onClick={() => updateDefectStatus(activeDefect.id, 'reviewed')}>Mark reviewed</button>
              <button className="button button-muted" onClick={() => updateDefectStatus(activeDefect.id, 'dismissed')}>Dismiss</button>
            </div>
          </section>
        )}

        {(screen === 'margins' || screen === 'ingredients') && (
          <section className="future-state">
            <span className="eyebrow">MISE · FUTURE STAGE</span>
            <h1>{screen === 'margins' ? 'Margins' : 'Ingredients'}</h1>
            <p>This feature is planned for a future stage.</p>
          </section>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        <button className={screen === 'issues' || screen === 'detail' || screen === 'import' || screen === 'error' || screen === 'validating' || screen === 'running' ? 'nav-item nav-active' : 'nav-item'} onClick={() => navTab('issues')}>
          <span className="nav-glyph nav-issues" aria-hidden="true" /> Issues
        </button>
        <button className={screen === 'margins' ? 'nav-item nav-active' : 'nav-item'} onClick={() => navTab('margins')}>
          <span className="nav-glyph nav-margins" aria-hidden="true" /> Margins
        </button>
        <button className={screen === 'ingredients' ? 'nav-item nav-active' : 'nav-item'} onClick={() => navTab('ingredients')}>
          <span className="nav-glyph nav-ingredients" aria-hidden="true" /> Ingredients
        </button>
      </nav>
    </div>
  );
}

export default App;