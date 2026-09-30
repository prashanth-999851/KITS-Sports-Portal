import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, UploadCloud, FileSpreadsheet, CheckCircle2, 
  XCircle, ArrowRight, RotateCcw, Download, Loader2, Sparkles, Info
} from 'lucide-react';
import { 
  validateAchievementRow, 
  getAchievementKey, 
  downloadAchievementExcelTemplate 
} from '../../utils/achievementUtils';

export default function AchievementExcelImportModal({
  isOpen,
  onClose,
  existingRecords = [],
  onImportComplete,
}) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [workbook, setWorkbook] = useState(null);
  const [rawRows, setRawRows] = useState([]);
  const [headers, setHeaders] = useState([]);

  // Wizard step: 'upload' | 'mapping' | 'preview'
  const [step, setStep] = useState('upload');

  // Column Mappings
  const [mapping, setMapping] = useState({
    tournament: '',
    sport: '',
    year: '',
    achievementType: '',
    winner: '',
    runnerUp: '',
    details: '',
  });

  // Import options
  const [defaultType, setDefaultType] = useState('Smart'); // 'Smart' | 'Trophy' | 'Gold' | 'Silver' | 'Bronze'
  const [updateExisting, setUpdateExisting] = useState(false);
  const [previewFilter, setPreviewFilter] = useState('all'); // 'all' | 'valid' | 'invalid' | 'duplicate'

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Existing database keys for duplicate check
  const existingKeySet = useMemo(() => {
    const set = new Set();
    for (const r of existingRecords) {
      const key = getAchievementKey(
        r.tournament || r.title,
        r.sport || r.category,
        r.year,
        r.achievementType || r.medalType
      );
      set.add(key);
    }
    return set;
  }, [existingRecords]);

  // Handle File Selection & Parse
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processSelectedFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    processSelectedFile(droppedFile);
  };

  const processSelectedFile = (selected) => {
    setUploadError('');
    setImportResult(null);

    // Validate extension
    const name = selected.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setUploadError('Invalid file format. Please upload an Excel (.xlsx or .xls) file.');
      return;
    }

    // Validate size (max 10MB)
    if (selected.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selected);
    setFileName(selected.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        setWorkbook(wb);
        setSheets(wb.SheetNames);
        const firstSheetName = wb.SheetNames[0];
        setSelectedSheet(firstSheetName);
        parseSheet(wb, firstSheetName);
        setStep('mapping');
      } catch (err) {
        console.error('Excel parse error:', err);
        setUploadError('Failed to parse Excel file. Please ensure it is not corrupt or password-protected.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Error reading file from disk.');
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(selected);
  };

  // Parse Sheet Data and Guess Columns
  const parseSheet = (wb, sheetName) => {
    const worksheet = wb.Sheets[sheetName];
    if (!worksheet) return;

    // Convert sheet to json array of objects
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    setRawRows(jsonData);

    // Extract headers from the first row or header array
    const rawHeaders = XLSX.utils.sheet_to_json(worksheet, { header: 1 })?.[0] || [];
    const cleanHeaders = rawHeaders.filter(h => h !== undefined && h !== null && String(h).trim() !== '');
    setHeaders(cleanHeaders);

    // Intelligent auto-detection of column mappings
    const newMapping = {
      tournament: '',
      sport: '',
      year: '',
      achievementType: '',
      winner: '',
      runnerUp: '',
      details: '',
    };

    cleanHeaders.forEach((h) => {
      const lower = String(h).toLowerCase().trim();

      if (!newMapping.tournament && (lower.includes('tourn') || lower.includes('competition') || lower.includes('event'))) {
        newMapping.tournament = h;
      } else if (!newMapping.sport && (lower.includes('sport') || lower.includes('game'))) {
        newMapping.sport = h;
      } else if (!newMapping.year && (lower.includes('year') || lower.includes('session'))) {
        newMapping.year = h;
      } else if (!newMapping.achievementType && (lower.includes('winner/runner') || lower.includes('achievement type') || lower.includes('type') || lower.includes('result') || lower.includes('position') || lower.includes('medal'))) {
        newMapping.achievementType = h;
      } else if (!newMapping.winner && (lower === 'winner' || lower.includes('won by') || lower.includes('first place'))) {
        newMapping.winner = h;
      } else if (!newMapping.runnerUp && (lower.includes('runner') || lower.includes('second place'))) {
        newMapping.runnerUp = h;
      } else if (!newMapping.details && (lower.includes('detail') || lower.includes('remark') || lower.includes('note'))) {
        newMapping.details = h;
      }
    });

    setMapping(newMapping);
  };

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    if (workbook) {
      parseSheet(workbook, sheetName);
    }
  };

  // Transform raw rows based on current mapping and run validation
  const validationResults = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return [];

    const pendingKeys = new Set();
    const results = [];

    rawRows.forEach((row, idx) => {
      // Map row fields
      const rawOutcome = (mapping.achievementType ? row[mapping.achievementType] : '') || row['Winner/Runner'] || row['winner/runner'] || row.Result || row.result || row.Position || row.position || '';

      const mappedRow = {
        tournament: mapping.tournament ? row[mapping.tournament] : '',
        sport: mapping.sport ? row[mapping.sport] : '',
        year: mapping.year ? row[mapping.year] : '',
        achievementType: defaultType !== 'Smart' 
          ? defaultType 
          : (mapping.achievementType ? row[mapping.achievementType] : 'Trophy'),
        winner: mapping.winner ? row[mapping.winner] : '',
        runnerUp: mapping.runnerUp ? row[mapping.runnerUp] : '',
        details: mapping.details ? row[mapping.details] : '',
        outcome: rawOutcome,
      };

      const res = validateAchievementRow(
        mappedRow, 
        idx + 1, 
        existingKeySet, 
        pendingKeys, 
        defaultType === 'Smart' ? 'Trophy' : defaultType
      );

      if (res.isValid && !res.isDuplicate) {
        pendingKeys.add(res.key);
      }

      results.push(res);
    });

    return results;
  }, [rawRows, mapping, defaultType, existingKeySet]);

  // Summary counts
  const summary = useMemo(() => {
    let total = validationResults.length;
    let valid = 0;
    let invalid = 0;
    let duplicate = 0;

    for (const r of validationResults) {
      if (!r.isValid) {
        invalid++;
      } else if (r.isDuplicate) {
        duplicate++;
      } else {
        valid++;
      }
    }

    return { total, valid, invalid, duplicate };
  }, [validationResults]);

  // Filtered rows for preview table
  const filteredPreviewRows = useMemo(() => {
    if (previewFilter === 'valid') {
      return validationResults.filter(r => r.isValid && !r.isDuplicate);
    }
    if (previewFilter === 'invalid') {
      return validationResults.filter(r => !r.isValid);
    }
    if (previewFilter === 'duplicate') {
      return validationResults.filter(r => r.isDuplicate);
    }
    return validationResults;
  }, [validationResults, previewFilter]);

  // Perform Final Batch Import
  const handleConfirmImport = async () => {
    // Collect records to import:
    // If updateExisting is true, include valid duplicates too; otherwise only new valid records
    const importable = validationResults
      .filter(r => r.isValid && (updateExisting ? true : !r.isDuplicate))
      .map(r => r.normalized);

    if (importable.length === 0) {
      alert('No valid records to import.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await onImportComplete(importable, updateExisting);
      setImportResult(res);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Import failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileName('');
    setSheets([]);
    setSelectedSheet('');
    setWorkbook(null);
    setRawRows([]);
    setHeaders([]);
    setStep('upload');
    setImportResult(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 id="import-modal-title" className="text-base font-bold text-[var(--text-primary)]">
                Import Achievements from Excel
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Parse, validate, preview, and import tournament trophies and medals safely into the database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadAchievementExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-400 transition-colors cursor-pointer"
              title="Download standardized sample Excel template"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample Template</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wizard Progress Bar */}
        <div className="px-6 py-2.5 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step === 'upload' ? 'bg-[#0b2e5b] text-white' : 'bg-emerald-600 text-white'
            }`}>
              {step !== 'upload' ? '✓' : '1'}
            </span>
            <span className={step === 'upload' ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
              Upload File
            </span>

            <span className="text-[var(--text-muted)]">→</span>

            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step === 'mapping' ? 'bg-[#0b2e5b] text-white' : step === 'preview' ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
            }`}>
              {step === 'preview' ? '✓' : '2'}
            </span>
            <span className={step === 'mapping' ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
              Column Mapping & Strategy
            </span>

            <span className="text-[var(--text-muted)]">→</span>

            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step === 'preview' ? 'bg-[#0b2e5b] text-white' : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
            }`}>
              3
            </span>
            <span className={step === 'preview' ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
              Row Validation & Preview
            </span>
          </div>

          {file && (
            <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate max-w-xs">
              File: <span className="text-[var(--text-primary)]">{fileName}</span>
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-6 max-w-2xl mx-auto py-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--border-color)] hover:border-blue-500 rounded-2xl p-10 text-center space-y-4 bg-[var(--bg-card-subtle)]/50 hover:bg-[var(--bg-card-subtle)] transition-all cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    Click to select or drag and drop your Excel file
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Supports Microsoft Excel files (.xlsx, .xls) up to 10MB
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
                  <Info className="w-4 h-4" />
                  <span>Supported Excel Column Formats</span>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Your Excel file can include columns like: <code className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">Tournament</code>, <code className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">Game / Sport</code>, <code className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">Year</code>, <code className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">Winner/Runner</code> (or Achievement Type), <code className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">Winner</code>, <code className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">Runner-up</code>.
                  In the next step, you can verify or customize which column maps to which field.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING & STRATEGY */}
          {step === 'mapping' && (
            <div className="space-y-6">
              {/* Sheet selector if workbook has multiple sheets */}
              {sheets.length > 1 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
                  <span className="font-semibold text-[var(--text-primary)]">Select Worksheet:</span>
                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                  >
                    {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="text-[var(--text-muted)]">({rawRows.length} rows detected)</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column Mappings Box */}
                <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-3">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Map Excel Columns to Database Fields</span>
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    We automatically matched columns based on your sheet headers. Review and adjust if needed:
                  </p>

                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Tournament / Competition Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={mapping.tournament}
                        onChange={(e) => setMapping({ ...mapping, tournament: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      >
                        <option value="">-- Select Column --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Game / Sport <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={mapping.sport}
                        onChange={(e) => setMapping({ ...mapping, sport: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      >
                        <option value="">-- Select Column --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Year (e.g. 2025, 2024-2025) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={mapping.year}
                        onChange={(e) => setMapping({ ...mapping, year: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      >
                        <option value="">-- Select Column --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Achievement Type / Result Column (Winner/Runner, Type, Medal)
                      </label>
                      <select
                        value={mapping.achievementType}
                        onChange={(e) => setMapping({ ...mapping, achievementType: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      >
                        <option value="">-- None / Use Default Type Below --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Optional Columns & Rules Box */}
                <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-3">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    Additional Columns & Import Strategy
                  </h4>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Winner Column (Optional)
                      </label>
                      <select
                        value={mapping.winner}
                        onChange={(e) => setMapping({ ...mapping, winner: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      >
                        <option value="">-- Default to KITS or Empty --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Runner-up Column (Optional)
                      </label>
                      <select
                        value={mapping.runnerUp}
                        onChange={(e) => setMapping({ ...mapping, runnerUp: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                      >
                        <option value="">-- None / Empty --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    {/* Achievement Type Mode */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Achievement Type Resolution
                      </label>
                      <select
                        value={defaultType}
                        onChange={(e) => setDefaultType(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                      >
                        <option value="Smart">Smart Auto-Detect (WINNER=Gold, RUNNER=Silver, 3RD=Bronze, Trophy=Trophy)</option>
                        <option value="Trophy">Import all as 🏆 Trophies</option>
                        <option value="Gold">Import all as 🥇 Gold Medals</option>
                        <option value="Silver">Import all as 🥈 Silver Medals</option>
                        <option value="Bronze">Import all as 🥉 Bronze Medals</option>
                      </select>
                    </div>

                    {/* Duplicate Strategy Checkbox */}
                    <div className="pt-2 border-t border-[var(--border-color)]">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={updateExisting}
                          onChange={(e) => setUpdateExisting(e.target.checked)}
                          className="rounded bg-[var(--bg-card)] border-[var(--border-color)] text-blue-600 focus:ring-0"
                        />
                        <span className="font-semibold text-[var(--text-primary)]">
                          Update existing records if duplicates are found
                        </span>
                      </label>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1 ml-5">
                        If unchecked, identical tournament/sport/year records already in the database will be safely skipped.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Choose Another File</span>
                </button>

                <button
                  onClick={() => setStep('preview')}
                  disabled={!mapping.tournament || !mapping.sport || !mapping.year}
                  className="px-4 py-2 rounded-lg bg-[#0b2e5b] hover:bg-[#104a8e] disabled:opacity-50 text-white font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Preview & Validate {rawRows.length} Rows</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & CONFIRMATION */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-center space-y-1">
                  <p className="text-xl font-extrabold text-[var(--text-primary)]">{summary.total}</p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Total Rows</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                  <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{summary.valid}</p>
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Valid (New)</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                  <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{summary.duplicate}</p>
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">Duplicates</p>
                </div>

                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-center space-y-1">
                  <p className="text-xl font-extrabold text-red-600 dark:text-red-400">{summary.invalid}</p>
                  <p className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase">Invalid Rows</p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[var(--text-muted)]">Show:</span>
                  {[
                    { id: 'all', label: `All (${summary.total})` },
                    { id: 'valid', label: `Valid (${summary.valid})` },
                    { id: 'duplicate', label: `Duplicates (${summary.duplicate})` },
                    { id: 'invalid', label: `Invalid (${summary.invalid})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setPreviewFilter(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        previewFilter === tab.id
                          ? 'bg-[#0b2e5b] text-white'
                          : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] text-[var(--text-muted)]">
                  {updateExisting 
                    ? 'Strategy: Updating existing duplicates' 
                    : 'Strategy: Skipping duplicates'}
                </span>
              </div>

              {/* Preview Table */}
              <div className="overflow-hidden rounded-xl border border-[var(--border-color)] max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-10 bg-[var(--bg-card-subtle)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Row</th>
                      <th className="py-2.5 px-3">Tournament</th>
                      <th className="py-2.5 px-3 w-28">Sport</th>
                      <th className="py-2.5 px-2 w-16 text-center">Year</th>
                      <th className="py-2.5 px-2 w-20 text-center">Type</th>
                      <th className="py-2.5 px-3">Winner</th>
                      <th className="py-2.5 px-3">Runner-up</th>
                      <th className="py-2.5 px-2.5 w-24 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                    {filteredPreviewRows.map((r) => {
                      const statusColor = !r.isValid 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                        : r.isDuplicate 
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';

                      return (
                        <tr 
                          key={r.rowIndex}
                          className={!r.isValid ? 'bg-red-500/5' : r.isDuplicate ? 'bg-amber-500/5' : 'hover:bg-[var(--bg-card-subtle)]'}
                        >
                          <td className="py-2.5 px-3 text-center font-bold text-[var(--text-muted)]">
                            {r.rowIndex}
                          </td>
                          <td className="py-2.5 px-3 font-semibold">
                            {r.normalized.tournament || <span className="text-red-500 italic">Missing Tournament</span>}
                            {r.normalized.details && (
                              <p className="text-[10px] text-[var(--text-muted)] font-normal truncate max-w-xs">
                                {r.normalized.details}
                              </p>
                            )}
                            {!r.isValid && (
                              <p className="text-[10px] text-red-500 font-normal mt-0.5">
                                {r.errors.join(' ')}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {r.normalized.sport || <span className="text-red-500 italic">Missing Sport</span>}
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold">
                            {r.normalized.year || <span className="text-red-500 italic">—</span>}
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
                              {r.normalized.achievementType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {r.normalized.winner ? (
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                                🏆 {r.normalized.winner.includes('KITS') ? 'KITS' : r.normalized.winner}
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)]">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {r.normalized.runnerUp ? (
                              <span className="text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                                🥈 {r.normalized.runnerUp.includes('KITS') ? 'KITS' : r.normalized.runnerUp}
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)]">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2.5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
                              {!r.isValid ? 'Invalid' : r.isDuplicate ? (updateExisting ? 'Update' : 'Duplicate') : 'Valid'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Import Result Banner */}
              {importResult && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Import Completed Successfully!</span>
                  </div>
                  <p className="text-xs">
                    {importResult.imported} new records imported, {importResult.updated} records updated, {importResult.skipped} duplicates skipped.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                <button
                  onClick={() => setStep('mapping')}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] font-semibold transition-colors"
                >
                  ← Back to Mapping
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="px-3.5 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmImport}
                    disabled={isProcessing || (summary.valid === 0 && (!updateExisting || summary.duplicate === 0))}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Importing Records...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          Confirm & Import {updateExisting ? (summary.valid + summary.duplicate) : summary.valid} Records
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
