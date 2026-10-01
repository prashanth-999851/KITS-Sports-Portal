import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Download, 
  Loader2, 
  AlertTriangle,
  Info,
  Check,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { 
  validateMembershipRow, 
  downloadMembershipExcelTemplate,
  STATUSES
} from '../../utils/membershipExcelUtils';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';

export default function MembershipExcelImportModal({
  isOpen,
  onClose,
  existingApplications = [],
  onImportComplete,
}) {
  const { importMemberships } = useConvexState();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);
  const [_file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [workbook, setWorkbook] = useState(null);
  const [rawRows, setRawRows] = useState([]);
  const [headers, setHeaders] = useState([]);

  // Wizard step: 'upload' | 'mapping' | 'preview' | 'summary'
  const [step, setStep] = useState('upload');

  // Column Mappings
  const [mapping, setMapping] = useState({
    name: '',
    rollNumber: '',
    year: '',
    department: '',
    section: '',
    gender: '',
    email: '',
    phone: '',
    preferredSports: '',
    status: '',
    remarks: '',
    trackingId: '',
  });

  // Import options
  const [defaultStatus, setDefaultStatus] = useState('Approved');
  const [updateExisting, setUpdateExisting] = useState(true);
  const [previewFilter, setPreviewFilter] = useState('all'); // 'all' | 'valid' | 'invalid' | 'duplicate'

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Existing database keys for duplicate check
  const { existingRollSet, existingTrackingSet } = useMemo(() => {
    const rollSet = new Set();
    const trackingSet = new Set();
    for (const app of existingApplications) {
      if (app.rollNumber) {
        rollSet.add(String(app.rollNumber).trim().toUpperCase());
      }
      if (app.id) {
        trackingSet.add(String(app.id).trim().toUpperCase());
      }
    }
    return { existingRollSet: rollSet, existingTrackingSet: trackingSet };
  }, [existingApplications]);

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
      setUploadError('Invalid file format. Please upload an Excel (.xlsx or .xls) or CSV file.');
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

  // Parse Sheet Data and Auto-Detect Columns
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
      name: '',
      rollNumber: '',
      year: '',
      department: '',
      section: '',
      gender: '',
      email: '',
      phone: '',
      preferredSports: '',
      status: '',
      remarks: '',
      trackingId: '',
    };

    cleanHeaders.forEach((h) => {
      const lower = String(h).toLowerCase().trim().replace(/[\s\-_]+/g, '');

      if (!newMapping.name && (lower.includes('studentname') || lower.includes('fullname') || lower === 'name' || lower === 'student')) {
        newMapping.name = h;
      } else if (!newMapping.rollNumber && (lower.includes('rollnumber') || lower.includes('rollno') || lower === 'roll' || lower.includes('regno') || lower.includes('registrationno'))) {
        newMapping.rollNumber = h;
      } else if (!newMapping.year && (lower.includes('academicyear') || lower === 'year' || lower.includes('classyear'))) {
        newMapping.year = h;
      } else if (!newMapping.department && (lower.includes('department') || lower === 'dept' || lower === 'branch')) {
        newMapping.department = h;
      } else if (!newMapping.section && (lower.includes('section') || lower === 'sec')) {
        newMapping.section = h;
      } else if (!newMapping.gender && (lower.includes('gender') || lower === 'sex')) {
        newMapping.gender = h;
      } else if (!newMapping.email && (lower.includes('email') || lower.includes('mail') || lower.includes('emailaddress'))) {
        newMapping.email = h;
      } else if (!newMapping.phone && (lower.includes('phone') || lower.includes('mobile') || lower.includes('contact') || lower.includes('phonenumber'))) {
        newMapping.phone = h;
      } else if (!newMapping.preferredSports && (lower.includes('sport') || lower.includes('preferredsport') || lower.includes('game') || lower.includes('discipline'))) {
        newMapping.preferredSports = h;
      } else if (!newMapping.status && (lower.includes('status') || lower.includes('reviewstatus') || lower.includes('initialstatus'))) {
        newMapping.status = h;
      } else if (!newMapping.remarks && (lower.includes('remark') || lower.includes('notes') || lower.includes('comments') || lower.includes('directorate'))) {
        newMapping.remarks = h;
      } else if (!newMapping.trackingId && (lower.includes('trackingid') || lower.includes('tracking') || lower === 'id' || lower.includes('applicationid'))) {
        newMapping.trackingId = h;
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

  // Build mapped rows and validate each
  const validatedData = useMemo(() => {
    if (rawRows.length === 0) return [];

    const pendingRollSet = new Set();
    const pendingTrackingSet = new Set();

    return rawRows.map((rawRow, index) => {
      const mappedRow = {
        name: mapping.name ? rawRow[mapping.name] : '',
        rollNumber: mapping.rollNumber ? rawRow[mapping.rollNumber] : '',
        year: mapping.year ? rawRow[mapping.year] : '',
        department: mapping.department ? rawRow[mapping.department] : '',
        section: mapping.section ? rawRow[mapping.section] : '',
        gender: mapping.gender ? rawRow[mapping.gender] : '',
        email: mapping.email ? rawRow[mapping.email] : '',
        phone: mapping.phone ? rawRow[mapping.phone] : '',
        preferredSports: mapping.preferredSports ? rawRow[mapping.preferredSports] : '',
        status: mapping.status ? rawRow[mapping.status] : defaultStatus,
        remarks: mapping.remarks ? rawRow[mapping.remarks] : '',
        trackingId: mapping.trackingId ? rawRow[mapping.trackingId] : '',
      };

      const result = validateMembershipRow(
        mappedRow,
        index + 1,
        existingRollSet,
        existingTrackingSet,
        pendingRollSet,
        pendingTrackingSet,
        defaultStatus
      );

      // Track pending unique keys
      if (result.normalized.rollNumber) {
        pendingRollSet.add(result.normalized.rollNumber);
      }
      if (result.normalized.trackingId) {
        pendingTrackingSet.add(result.normalized.trackingId);
      }

      return result;
    });
  }, [rawRows, mapping, defaultStatus, existingRollSet, existingTrackingSet]);

  // Statistics
  const stats = useMemo(() => {
    const total = validatedData.length;
    let valid = 0;
    let invalid = 0;
    let duplicate = 0;

    for (const item of validatedData) {
      if (item.isDuplicate) {
        duplicate++;
      }
      if (item.isValid) {
        valid++;
      } else {
        invalid++;
      }
    }

    return { total, valid, invalid, duplicate };
  }, [validatedData]);

  // Filter preview list
  const filteredPreview = useMemo(() => {
    if (previewFilter === 'valid') {
      return validatedData.filter(d => d.isValid && (!d.isDuplicate || updateExisting));
    }
    if (previewFilter === 'invalid') {
      return validatedData.filter(d => !d.isValid);
    }
    if (previewFilter === 'duplicate') {
      return validatedData.filter(d => d.isDuplicate);
    }
    return validatedData;
  }, [validatedData, previewFilter, updateExisting]);

  // Compute records to submit
  const recordsToImport = useMemo(() => {
    return validatedData
      .filter(d => d.isValid && (updateExisting ? true : !d.isDuplicate))
      .map(d => ({
        studentName: d.normalized.name,
        rollNumber: d.normalized.rollNumber,
        department: d.normalized.department,
        year: d.normalized.year,
        section: d.normalized.section,
        gender: d.normalized.gender,
        email: d.normalized.email,
        phone: d.normalized.phone,
        preferredSports: d.normalized.preferredSports,
        status: d.normalized.status,
        remarks: d.normalized.remarks,
        trackingId: d.normalized.trackingId,
        playingExperience: d.normalized.playingExperience,
      }));
  }, [validatedData, updateExisting]);

  // Handle final bulk import execution
  const handleExecuteImport = async () => {
    if (recordsToImport.length === 0) {
      showToast('No valid membership records available to import.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await importMemberships(recordsToImport, updateExisting);
      setImportResult(res);
      setStep('summary');
      showToast(`Import completed: ${res.imported} added, ${res.updated} updated.`, 'success');
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      console.error('Import error:', err);
      showToast(`Import failed: ${err.message || 'Unknown error occurred'}`, 'error');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-5 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Bulk Import Memberships from Excel</h3>
              <p className="text-xs text-[var(--text-muted)]">Upload institutional spreadsheet to enroll or update student athletes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step !== 'upload' && step !== 'summary' && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Start Over"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-1 shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            step === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
          }`}>
            <span>1</span>
            <span>Upload File</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            step === 'mapping' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
          }`}>
            <span>2</span>
            <span>Map Columns</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            step === 'preview' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
          }`}>
            <span>3</span>
            <span>Validation & Preview</span>
          </div>
        </div>

        {/* ================= STEP 1: UPLOAD ================= */}
        {step === 'upload' && (
          <div className="space-y-5 overflow-y-auto flex-1 pr-1">
            
            {/* Download Template Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                  <Download className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">Official Membership Excel Template</h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300">
                    Download a clean spreadsheet template with pre-configured column headers and institutional guidelines.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadMembershipExcelTemplate}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Clean Template</span>
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--border-color)] hover:border-blue-500 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 bg-[var(--bg-card-subtle)]/50 hover:bg-[var(--bg-card-subtle)] transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  Click to browse or drag and drop your spreadsheet
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Supported formats: Microsoft Excel (.xlsx, .xls) or CSV up to 10MB
                </p>
              </div>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Guidelines Card */}
            <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Important Import Rules & Institutional Constraints</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-[var(--text-muted)]">
                <li><strong className="text-[var(--text-primary)]">Roll Number:</strong> Must be a valid KITS roll number (e.g. <code className="text-blue-600 dark:text-blue-400 font-mono">22JR1A0501</code>). Used as the primary unique student identifier.</li>
                <li><strong className="text-[var(--text-primary)]">Academic Year:</strong> Must be <em>1st Year</em>, <em>2nd Year</em>, <em>3rd Year</em>, or <em>4th Year</em>.</li>
                <li><strong className="text-[var(--text-primary)]">Department:</strong> Must be eligible for that year (e.g. <em>CAI</em> is available in 4th Year).</li>
                <li><strong className="text-[var(--text-primary)]">Section:</strong> Normalized automatically (e.g. entering <code className="font-mono">1</code> becomes <code className="font-mono">Section 1</code>).</li>
                <li><strong className="text-[var(--text-primary)]">Preferred Sport:</strong> Must match recognized sports (<code className="text-blue-600 dark:text-blue-400">Cricket</code>, <code className="text-blue-600 dark:text-blue-400">Volleyball</code>, etc.).</li>
                <li><strong className="text-[var(--text-primary)]">Tracking ID:</strong> Optional. Leave blank to generate official registration code (<code className="font-mono">KKR-2026-XXXX</code>).</li>
              </ul>
            </div>

          </div>
        )}

        {/* ================= STEP 2: COLUMN MAPPING ================= */}
        {step === 'mapping' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            
            {/* Sheet Selector (if multiple sheets exist) */}
            {sheets.length > 1 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs">
                <span className="font-semibold text-[var(--text-secondary)]">Active Sheet to Import:</span>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs"
                >
                  {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
              <span>File: <strong>{fileName}</strong> • Detected <strong>{rawRows.length} rows</strong> in sheet <em>"{selectedSheet}"</em>. Verify or adjust column mappings below.</span>
              <span className="font-bold">{headers.length} Columns Found</span>
            </div>

            {/* Mapping Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              
              {/* 1. Student Name */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={mapping.name}
                  onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Select Excel Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 2. Roll Number */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <select
                  value={mapping.rollNumber}
                  onChange={(e) => setMapping({ ...mapping, rollNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Select Excel Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 3. Academic Year */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={mapping.year}
                  onChange={(e) => setMapping({ ...mapping, year: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Select Excel Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 4. Department */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={mapping.department}
                  onChange={(e) => setMapping({ ...mapping, department: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Select Excel Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 5. Section */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Section <span className="text-red-500">*</span>
                </label>
                <select
                  value={mapping.section}
                  onChange={(e) => setMapping({ ...mapping, section: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Select Excel Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 6. Gender */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={mapping.gender}
                  onChange={(e) => setMapping({ ...mapping, gender: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Select Excel Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 7. Email Address */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <select
                  value={mapping.email}
                  onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Select Excel Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 8. Phone Number */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <select
                  value={mapping.phone}
                  onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Select Excel Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 9. Preferred Sport */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Preferred Sport <span className="text-red-500">*</span>
                </label>
                <select
                  value={mapping.preferredSports}
                  onChange={(e) => setMapping({ ...mapping, preferredSports: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Select Excel Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 10. Status */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Status <span className="text-[10px] text-[var(--text-muted)] font-normal">(Optional)</span>
                </label>
                <select
                  value={mapping.status}
                  onChange={(e) => setMapping({ ...mapping, status: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Defaults to "{defaultStatus}" --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 11. Remarks */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Directorate Remarks <span className="text-[10px] text-[var(--text-muted)] font-normal">(Optional)</span>
                </label>
                <select
                  value={mapping.remarks}
                  onChange={(e) => setMapping({ ...mapping, remarks: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- No Remarks --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* 12. Tracking ID */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)]">
                  Tracking ID <span className="text-[10px] text-[var(--text-muted)] font-normal">(Optional)</span>
                </label>
                <select
                  value={mapping.trackingId}
                  onChange={(e) => setMapping({ ...mapping, trackingId: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
                >
                  <option value="">-- Auto-generate New ID --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

            </div>

            {/* Options Bar */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--text-secondary)]">Fallback Status if omitted in sheet:</span>
                <select
                  value={defaultStatus}
                  onChange={(e) => setDefaultStatus(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] font-bold text-[var(--text-primary)]"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-3 py-1.5 rounded-lg font-semibold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('preview')}
                  disabled={!mapping.name || !mapping.rollNumber}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 shadow transition-colors cursor-pointer"
                >
                  <span>Review & Validate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= STEP 3: PREVIEW & VALIDATION ================= */}
        {step === 'preview' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div 
                onClick={() => setPreviewFilter('all')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  previewFilter === 'all' 
                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20' 
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-blue-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Total Scanned</span>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>

              <div 
                onClick={() => setPreviewFilter('valid')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  previewFilter === 'valid' 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20' 
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-emerald-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Valid Rows</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.valid}</p>
              </div>

              <div 
                onClick={() => setPreviewFilter('duplicate')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  previewFilter === 'duplicate' 
                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20' 
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-amber-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Duplicates / Existing</span>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.duplicate}</p>
              </div>

              <div 
                onClick={() => setPreviewFilter('invalid')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  previewFilter === 'invalid' 
                    ? 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 dark:text-red-300 ring-2 ring-red-500/20' 
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-red-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400">Invalid Rows</span>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.invalid}</p>
              </div>
            </div>

            {/* Existing Member Handling Toggle */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-[var(--border-color)] focus:ring-blue-500"
                />
                <span className="font-bold text-[var(--text-primary)]">
                  Update existing member details when Roll Number already exists in database
                </span>
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">
                {updateExisting ? 'Existing members will be updated in-place.' : 'Existing members will be skipped.'}
              </span>
            </div>

            {/* Preview Table */}
            <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-card)]">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] uppercase font-bold sticky top-0 border-b border-[var(--border-color)] z-10">
                    <tr>
                      <th className="p-2.5 text-center">Row</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Roll & Dept</th>
                      <th className="p-2.5">Year & Sec</th>
                      <th className="p-2.5">Gender</th>
                      <th className="p-2.5">Preferred Sport</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Validation Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                    {filteredPreview.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="p-6 text-center text-[var(--text-muted)] italic">
                          No records match the current filter "{previewFilter}".
                        </td>
                      </tr>
                    ) : (
                      filteredPreview.map((item) => (
                        <tr 
                          key={item.rowIndex} 
                          className={`hover:bg-[var(--bg-card-subtle)]/70 transition-colors ${
                            !item.isValid ? 'bg-red-50/40 dark:bg-red-950/10' : 
                            item.isDuplicate ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''
                          }`}
                        >
                          <td className="p-2.5 text-center font-mono text-[11px] font-bold text-[var(--text-muted)]">
                            #{item.rowIndex}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            {item.isValid ? (
                              item.isDuplicate ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{updateExisting ? 'Will Update' : 'Duplicate'}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                                  <Check className="w-3 h-3" />
                                  <span>Valid</span>
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                                <XCircle className="w-3 h-3" />
                                <span>Invalid</span>
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-[var(--text-primary)]">
                            {item.normalized.name || <span className="text-red-500 italic">Missing</span>}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <div className="font-mono font-semibold">{item.normalized.rollNumber || '—'}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">{item.normalized.department || '—'}</div>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <div>{item.normalized.year}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">{item.normalized.section}</div>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            {item.normalized.gender}
                          </td>
                          <td className="p-2.5 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400">
                            {item.normalized.preferredSports[0]}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)]">
                              {item.normalized.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px] max-w-xs">
                            {item.errors.length > 0 ? (
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                {item.errors.join(' • ')}
                              </span>
                            ) : item.isDuplicate ? (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                {item.duplicateReason}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">Ready to onboard</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setStep('mapping')}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg font-semibold text-xs bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Back to Mapping
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isProcessing || recordsToImport.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing Members...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>
                      {updateExisting 
                        ? `Import & Sync ${recordsToImport.length} Members` 
                        : `Import ${recordsToImport.length} New Members`}
                    </span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ================= STEP 4: SUMMARY ================= */}
        {step === 'summary' && importResult && (
          <div className="space-y-6 py-6 text-center flex-1 flex flex-col items-center justify-center">
            
            <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Bulk Membership Import Succeeded!</h3>
              <p className="text-xs text-[var(--text-muted)]">
                The spreadsheet records have been verified and processed into the official sports membership registry.
              </p>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                <span className="text-[10px] font-bold uppercase">New Members</span>
                <p className="text-2xl font-bold">{importResult.imported}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300">
                <span className="text-[10px] font-bold uppercase">Updated Records</span>
                <p className="text-2xl font-bold">{importResult.updated}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-secondary)]">
                <span className="text-[10px] font-bold uppercase">Skipped</span>
                <p className="text-2xl font-bold">{importResult.skipped}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Import Another File</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white transition-colors cursor-pointer shadow"
              >
                <Check className="w-4 h-4" />
                <span>Done & View Memberships</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
