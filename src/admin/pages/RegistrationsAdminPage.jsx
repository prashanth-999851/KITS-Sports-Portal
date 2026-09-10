import React, { useState, useEffect } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { TableRowSkeleton, MetricCardSkeleton, AdminTablePageSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { 
  ClipboardList, 
  Check, 
  X, 
  Search, 
  RotateCcw, 
  FileSpreadsheet, 
  FileText, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { 
  ADMIN_ACADEMIC_YEARS
} from '../../constants/academicRules';

const ALL_FILTER_DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'CAI', 'CSM', 'CSD'];
const ADMIN_YEARS = ADMIN_ACADEMIC_YEARS;
const AVAILABLE_SPORTS = ['Cricket', 'Volleyball', 'Basketball', 'Badminton', 'Kabaddi', 'Kho-Kho', 'Netball', 'Ball-Badminton', 'Athletics'];
const STATUS_TABS = ['Pending', 'Approved', 'Rejected', 'All'];
const GENDERS = ['Male', 'Female'];

export default function RegistrationsAdminPage() {
  const { 
    applications, 
    updateApplicationStatus, 
    updateApplication, 
    deleteApplication, 
    isLoading,
    isLoadingApplications 
  } = useConvexState();
  const { showToast } = useToast();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending'); // Default view: Pending Review
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [sportFilter, setSportFilter] = useState('All');

  // Modals & Menu state
  const [activeMenu, setActiveMenu] = useState(null); // { id, app, top, right, openUpward }
  const [editingApp, setEditingApp] = useState(null);
  const [deletingApp, setDeletingApp] = useState(null);
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionRemark, setRejectionRemark] = useState('');
  const [viewingApp, setViewingApp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle floating actions menu with smart dropup detection
  const handleToggleMenu = (e, app) => {
    e.stopPropagation();
    if (activeMenu?.id === app.id) {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 290;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setActiveMenu({
      id: app.id,
      app,
      rectTop: rect.top,
      rectBottom: rect.bottom,
      right: Math.max(16, window.innerWidth - rect.right),
      openUpward,
    });
  };

  // Close floating actions menu on outside click, window scroll, or resize
  useEffect(() => {
    const handleCloseMenu = (e) => {
      if (e?.target?.closest?.('.floating-action-menu')) return;
      setActiveMenu(null);
    };
    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('scroll', handleCloseMenu, true);
    window.addEventListener('resize', handleCloseMenu);
    return () => {
      window.removeEventListener('click', handleCloseMenu);
      window.removeEventListener('scroll', handleCloseMenu, true);
      window.removeEventListener('resize', handleCloseMenu);
    };
  }, []);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    rollNumber: '',
    department: 'CSE',
    year: '2nd Year',
    section: 'Section 1',
    gender: 'Male',
    email: '',
    phone: '',
    preferredSports: 'Cricket',
    playingExperience: 'No Previous Experience',
    experienceCertificateFileId: '',
    experienceCertificateUrl: null,
    status: 'Pending',
    remarks: '',
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('Pending');
    setDeptFilter('All');
    setYearFilter('All');
    setGenderFilter('All');
    setSportFilter('All');
    showToast('Filters reset to default.', 'info');
  };

  // Quick Approval Flow
  const handleApprove = async (app) => {
    try {
      await updateApplicationStatus(app.id, 'Approved', 'Approved by Sports Directorate');
      showToast('Application approved! Student moved to Memberships.', 'success');
    } catch (err) {
      showToast('Error approving application: ' + (err.message || err), 'error');
    }
  };

  // Open Reject Modal
  const handleOpenReject = (app) => {
    setRejectingApp(app);
    setRejectionRemark('');
  };

  // Confirm Rejection Flow
  const handleConfirmReject = async () => {
    if (!rejectingApp) return;
    setIsSubmitting(true);
    try {
      const remark = rejectionRemark.trim() || 'Registration application rejected by Sports Directorate';
      await updateApplicationStatus(rejectingApp.id, 'Rejected', remark);
      showToast('Application rejected.', 'warning');
      setRejectingApp(null);
    } catch (err) {
      showToast('Error rejecting application: ' + (err.message || err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revoke / Reopen to Pending
  const handleRevokeToPending = async (app) => {
    try {
      await updateApplicationStatus(app.id, 'Pending', 'Membership revoked and reopened for review');
      showToast('Membership revoked. Returned to Pending Review queue.', 'warning');
    } catch (err) {
      showToast('Error reopening application: ' + (err.message || err), 'error');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (app) => {
    setEditingApp(app);
    const sportsVal = Array.isArray(app.preferredSports) ? (app.preferredSports[0] || 'Cricket') : (app.preferredSports || 'Cricket');
    setEditForm({
      name: app.name || '',
      rollNumber: app.rollNumber || '',
      department: app.department || 'CSE',
      year: app.year || '2nd Year',
      section: app.section || 'Section 1',
      gender: app.gender || 'Male',
      email: app.email || '',
      phone: app.phone || '',
      preferredSports: sportsVal,
      playingExperience: app.playingExperience || 'No Previous Experience',
      experienceCertificateFileId: app.experienceCertificateFileId || '',
      experienceCertificateUrl: app.experienceCertificateUrl || null,
      status: app.status || 'Pending',
      remarks: app.remarks || '',
    });
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingApp) return;

    setIsSubmitting(true);
    try {
      await updateApplication(editingApp.id, {
        studentName: editForm.name,
        rollNumber: editForm.rollNumber,
        department: editForm.department,
        year: editForm.year,
        section: editForm.section,
        gender: editForm.gender,
        email: editForm.email,
        phone: editForm.phone,
        preferredSports: [editForm.preferredSports],
        playingExperience: editForm.playingExperience,
        experienceCertificateFileId: editForm.playingExperience === 'Have Playing Experience' ? editForm.experienceCertificateFileId : undefined,
        status: editForm.status,
        remarks: editForm.remarks,
      });

      if (editForm.status !== editingApp.status || editForm.remarks !== editingApp.remarks) {
        await updateApplicationStatus(editingApp.id, editForm.status, editForm.remarks);
      }

      if (editForm.status === 'Approved' && editingApp.status !== 'Approved') {
        showToast('Application approved! Student moved to Memberships.', 'success');
      } else {
        showToast('Registration details updated successfully.', 'success');
      }
      setEditingApp(null);
    } catch (err) {
      showToast('Error updating application: ' + (err.message || err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete flow
  const handleConfirmDelete = async () => {
    if (!deletingApp) return;
    setIsSubmitting(true);
    try {
      await deleteApplication(deletingApp.id);
      showToast('Registration deleted permanently.', 'success');
      setDeletingApp(null);
    } catch (err) {
      showToast('Error deleting application: ' + (err.message || err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered applications
  const filteredApps = applications.filter(app => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (app.id && app.id.toLowerCase().includes(query)) ||
      (app.name && app.name.toLowerCase().includes(query)) ||
      (app.rollNumber && app.rollNumber.toLowerCase().includes(query)) ||
      (app.email && app.email.toLowerCase().includes(query)) ||
      (app.phone && app.phone.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'All' ? true : app.status === statusFilter;
    const matchesDepartment = deptFilter === 'All' || app.department === deptFilter;
    const matchesYear = yearFilter === 'All' || app.year === yearFilter;
    const matchesGender = genderFilter === 'All' || (app.gender || 'Male') === genderFilter;
    
    const matchesSport = sportFilter === 'All' || (
      Array.isArray(app.preferredSports) 
        ? app.preferredSports.includes(sportFilter)
        : (app.preferredSports && app.preferredSports === sportFilter)
    );

    return matchesSearch && matchesStatus && matchesDepartment && matchesYear && matchesGender && matchesSport;
  });

  const activeFilterCount = (statusFilter !== 'Pending' ? 1 : 0) + 
                            (deptFilter !== 'All' ? 1 : 0) + 
                            (yearFilter !== 'All' ? 1 : 0) + 
                            (genderFilter !== 'All' ? 1 : 0) + 
                            (sportFilter !== 'All' ? 1 : 0) + 
                            (searchQuery ? 1 : 0);

  // Metrics
  const pendingApps = applications.filter(a => a.status === 'Pending');
  const approvedApps = applications.filter(a => a.status === 'Approved');
  const rejectedApps = applications.filter(a => a.status === 'Rejected');

  // Excel Export
  const handleExportToExcel = () => {
    if (filteredApps.length === 0) {
      showToast('No registration records match the current filter criteria to export.', 'warning');
      return;
    }

    const exportData = filteredApps.map(app => ({
      "Tracking ID": app.id || '',
      "Student Name": app.name || '',
      "Roll Number": app.rollNumber || '',
      "Department": app.department || '',
      "Academic Year": app.year || '',
      "Gender": app.gender || 'Male',
      "Section": app.section || '',
      "Preferred Sport": Array.isArray(app.preferredSports) ? app.preferredSports.join(", ") : (app.preferredSports || ''),
      "Playing Experience": app.playingExperience || 'No Previous Experience',
      "Has Certificate": (app.experienceCertificateFileId || app.experienceCertificateUrl) ? 'Yes' : 'No',
      "Email Address": app.email || '',
      "Phone Number": app.phone || '',
      "Review Status": app.status || 'Pending',
      "Directorate Remarks": app.remarks || '',
      "Submitted Date": app.appliedDate || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 16 }, // Tracking ID
      { wch: 24 }, // Student Name
      { wch: 15 }, // Roll Number
      { wch: 12 }, // Department
      { wch: 14 }, // Academic Year
      { wch: 10 }, // Gender
      { wch: 12 }, // Section
      { wch: 20 }, // Preferred Sport
      { wch: 24 }, // Playing Experience
      { wch: 16 }, // Has Certificate
      { wch: 28 }, // Email
      { wch: 16 }, // Phone
      { wch: 14 }, // Review Status
      { wch: 40 }, // Remarks
      { wch: 14 }, // Submitted Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    const dateTag = new Date().toISOString().split('T')[0];
    const fileName = `KITS_Sports_Registrations_${dateTag}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showToast('Exported registrations successfully.', 'success');
  };

  if (isLoading || isLoadingApplications) {
    return (
      <AdminTablePageSkeleton 
        title="Student Registrations Intake & Review" 
        subtitle="Loading pending student registration queue and verification workflow..." 
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Student Registrations Intake & Review</h2>
            {pendingApps.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950">
                {pendingApps.length} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Review incoming candidate applications, verify uploaded playing experience certificates, and approve candidates into official club memberships.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Export to Excel */}
          <button
            onClick={handleExportToExcel}
            disabled={isLoading || filteredApps.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export ({filteredApps.length}) to Excel</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      {isLoading ? (
        <MetricCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'Pending'
                ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-semibold">Pending Approvals</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingApps.length}</p>
          </button>

          <button
            onClick={() => setStatusFilter('Approved')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'Approved'
                ? 'bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/20'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-emerald-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-semibold">Approved & Members</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{approvedApps.length}</p>
          </button>

          <button
            onClick={() => setStatusFilter('Rejected')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'Rejected'
                ? 'bg-red-500/10 border-red-500/40 ring-2 ring-red-500/20'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-semibold">Rejected Submissions</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{rejectedApps.length}</p>
          </button>

          <button
            onClick={() => setStatusFilter('All')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-blue-500/10 border-blue-500/40 ring-2 ring-blue-500/20'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-semibold">Total Submissions</span>
              <ClipboardList className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{applications.length}</p>
          </button>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
        
        {/* Review Status Quick Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-[var(--text-muted)] mr-1">Status:</span>
            {STATUS_TABS.map((tab) => {
              const count = tab === 'Pending' ? pendingApps.length :
                            tab === 'Approved' ? approvedApps.length :
                            tab === 'Rejected' ? rejectedApps.length : applications.length;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    statusFilter === tab
                      ? 'bg-[#0d3a73] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]'
                  }`}
                >
                  <span>{tab === 'Pending' ? 'Pending Review' : tab === 'All' ? 'All Submissions' : tab}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab ? 'bg-white/20 text-white' : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="md:col-span-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search Name / Roll / Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              {ALL_FILTER_DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Academic Years</option>
              {ADMIN_YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Genders</option>
              {GENDERS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Sport Filter */}
          <div>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Sports</option>
              {AVAILABLE_SPORTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Registrations Table Container */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm">
        
        {/* Table Header Summary */}
        <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-primary)]">
            Displaying {filteredApps.length} Application{filteredApps.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            Review Status: <strong className="text-blue-600 dark:text-blue-400">{statusFilter === 'Pending' ? 'Pending Review' : statusFilter}</strong>
          </span>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <TableRowSkeleton rows={6} />
        ) : filteredApps.length === 0 ? (
          <EmptyState
            title="No Registration Records Found"
            description={activeFilterCount > 0 ? "No student registrations match the active filter combination. Try resetting filters." : "There are currently no student registrations in this status queue."}
            icon={ClipboardList}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] uppercase font-bold border-b border-[var(--border-color)]">
                <tr>
                  <th className="p-3">Tracking ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll & Dept</th>
                  <th className="p-3">Gender & Sec</th>
                  <th className="p-3">Sport Preference</th>
                  <th className="p-3">Playing Experience</th>
                  <th className="p-3">Certificate</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                    
                    {/* Tracking ID */}
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {app.id}
                    </td>

                    {/* Student Name */}
                    <td className="p-3 font-bold text-[var(--text-primary)]">
                      <button
                        onClick={() => setViewingApp(app)}
                        className="text-left hover:text-blue-600 hover:underline cursor-pointer"
                        title="Click to view full application details"
                      >
                        {app.name}
                      </button>
                    </td>

                    {/* Roll & Dept */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold">{app.rollNumber}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{app.department} • {app.year}</div>
                    </td>

                    {/* Gender & Sec */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-medium">{app.gender || 'Male'}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{app.section || 'N/A'}</div>
                    </td>

                    {/* Sport Preference */}
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-[11px]">
                        {Array.isArray(app.preferredSports) ? app.preferredSports.join(", ") : app.preferredSports}
                      </span>
                    </td>

                    {/* Playing Experience */}
                    <td className="p-3 whitespace-nowrap">
                      {app.playingExperience === 'Have Playing Experience' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                          Has Experience
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          No Experience
                        </span>
                      )}
                    </td>

                    {/* Certificate */}
                    <td className="p-3 whitespace-nowrap">
                      {app.experienceCertificateUrl ? (
                        <a
                          href={app.experienceCertificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                          title="View Experience Certificate PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>View Certificate</span>
                        </a>
                      ) : app.playingExperience === 'Have Playing Experience' ? (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          No Certificate
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    {/* Contact Info */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="truncate max-w-[150px]">{app.email}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{app.phone}</div>
                    </td>

                    {/* Status */}
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                        app.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30' :
                        'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    {/* Submitted Date */}
                    <td className="p-3 text-[var(--text-muted)] whitespace-nowrap">
                      {app.appliedDate || '—'}
                    </td>
                    {/* Actions */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Quick 1-Click Approve for Pending Applications */}
                        {app.status === 'Pending' && (
                          <button
                            onClick={() => handleApprove(app)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                            title="Quick Approve and move to Memberships"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Actions Trigger Button */}
                        <button
                          onClick={(e) => handleToggleMenu(e, app)}
                          className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm ${
                            activeMenu?.id === app.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500/40 hover:bg-[var(--bg-card-subtle)]'
                          }`}
                          title="Actions Menu"
                        >
                          <MoreVertical className={`w-3.5 h-3.5 ${activeMenu?.id === app.id ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                          <span>Actions</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeMenu?.id === app.id ? 'rotate-180 text-white' : 'text-[var(--text-muted)]'}`} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ================= FLOATING ACTIONS MENU (NEVER CLIPPED) ================= */}
      {activeMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: activeMenu.openUpward ? 'auto' : `${activeMenu.rectBottom + 6}px`,
            bottom: activeMenu.openUpward ? `${window.innerHeight - activeMenu.rectTop + 6}px` : 'auto',
            right: `${activeMenu.right}px`,
            maxHeight: 'min(360px, calc(100vh - 32px))',
            zIndex: 99999,
          }}
          className="floating-action-menu w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.25)] p-1.5 animate-fadeIn text-xs space-y-1 divide-y divide-[var(--border-color)]/70 overflow-y-auto"
        >
          {/* Header */}
          <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Actions Menu</span>
            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">{activeMenu.app.id}</span>
          </div>

          {/* Primary Operations */}
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => {
                const app = activeMenu.app;
                setActiveMenu(null);
                setViewingApp(app);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[var(--text-primary)] hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 transition-colors cursor-pointer font-semibold"
            >
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>View Full Details</span>
            </button>

            <button
              onClick={() => {
                const app = activeMenu.app;
                setActiveMenu(null);
                handleOpenEdit(app);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[var(--text-primary)] hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 transition-colors cursor-pointer font-semibold"
            >
              <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Edit Application</span>
            </button>

            {activeMenu.app.experienceCertificateUrl && (
              <a
                href={activeMenu.app.experienceCertificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveMenu(null)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[var(--text-primary)] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors cursor-pointer font-semibold"
              >
                <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>View Certificate PDF</span>
              </a>
            )}
          </div>

          {/* Review Decisions */}
          <div className="space-y-0.5 pt-1">
            {activeMenu.app.status !== 'Approved' && (
              <button
                onClick={() => {
                  const app = activeMenu.app;
                  setActiveMenu(null);
                  handleApprove(app);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer font-semibold"
              >
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Approve & Admit</span>
              </button>
            )}

            {activeMenu.app.status !== 'Rejected' && (
              <button
                onClick={() => {
                  const app = activeMenu.app;
                  setActiveMenu(null);
                  handleOpenReject(app);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer font-semibold"
              >
                <X className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>Reject Application</span>
              </button>
            )}

            {activeMenu.app.status !== 'Pending' && (
              <button
                onClick={() => {
                  const app = activeMenu.app;
                  setActiveMenu(null);
                  handleRevokeToPending(app);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer font-semibold"
              >
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Return to Review</span>
              </button>
            )}
          </div>

          {/* Danger Zone */}
          <div className="pt-1">
            <button
              onClick={() => {
                const app = activeMenu.app;
                setActiveMenu(null);
                setDeletingApp(app);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer font-semibold"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>Delete Application</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= REJECT REMARK MODAL ================= */}
      {rejectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Reject Application</h3>
                <p className="text-xs text-[var(--text-muted)]">Rejecting candidate {rejectingApp.name} ({rejectingApp.rollNumber})</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Directorate Remarks / Reason for Rejection</label>
              <textarea
                rows={3}
                value={rejectionRemark}
                onChange={(e) => setRejectionRemark(e.target.value)}
                placeholder="e.g., Incomplete eligibility criteria, invalid sports certificate, or team quota full..."
                className="w-full p-2.5 rounded-lg text-xs bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectingApp(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW APPLICATION DETAILS MODAL ================= */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{viewingApp.id}</span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Registration Application Details</h3>
              </div>
              <button
                onClick={() => setViewingApp(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Student Name</span>
                <p className="font-bold text-[var(--text-primary)]">{viewingApp.name}</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Roll Number</span>
                <p className="font-bold text-[var(--text-primary)]">{viewingApp.rollNumber}</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Department & Year</span>
                <p className="font-semibold text-[var(--text-primary)]">{viewingApp.department} • {viewingApp.year}</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Gender & Section</span>
                <p className="font-semibold text-[var(--text-primary)]">{viewingApp.gender || 'Male'} • {viewingApp.section || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Contact Email</span>
                <p className="font-semibold text-[var(--text-primary)] truncate">{viewingApp.email}</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Phone Number</span>
                <p className="font-semibold text-[var(--text-primary)]">{viewingApp.phone}</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Sport Preference</span>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  {Array.isArray(viewingApp.preferredSports) ? viewingApp.preferredSports.join(", ") : viewingApp.preferredSports}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Playing Experience</span>
                <p className="font-semibold text-[var(--text-primary)]">
                  {viewingApp.playingExperience === 'Have Playing Experience' ? 'Has Experience' : 'No Experience'}
                </p>
              </div>
            </div>

            {/* Certificate Section */}
            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Experience Certificate</span>
                <p className="text-xs text-[var(--text-secondary)]">
                  {viewingApp.experienceCertificateUrl ? 'Official PDF certificate uploaded.' : 'No certificate on file.'}
                </p>
              </div>
              {viewingApp.experienceCertificateUrl ? (
                <a
                  href={viewingApp.experienceCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-xs text-[var(--text-muted)] italic">N/A</span>
              )}
            </div>

            {/* Remarks Section */}
            {viewingApp.remarks && (
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Directorate Remarks</span>
                <p className="text-xs text-[var(--text-secondary)]">{viewingApp.remarks}</p>
              </div>
            )}

            {/* Quick Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                viewingApp.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                viewingApp.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' :
                'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
              }`}>
                Current Status: {viewingApp.status}
              </span>

              <div className="flex items-center gap-2">
                {viewingApp.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        const appToApprove = viewingApp;
                        setViewingApp(null);
                        handleApprove(appToApprove);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Approve Application
                    </button>
                    <button
                      onClick={() => {
                        const appToReject = viewingApp;
                        setViewingApp(null);
                        handleOpenReject(appToReject);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reject Application
                    </button>
                  </>
                )}
                {viewingApp.status === 'Approved' && (
                  <>
                    <button
                      onClick={() => {
                        const appToReopen = viewingApp;
                        setViewingApp(null);
                        handleRevokeToPending(appToReopen);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reopen Review
                    </button>
                    <button
                      onClick={() => {
                        const appToReject = viewingApp;
                        setViewingApp(null);
                        handleOpenReject(appToReject);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reject Application
                    </button>
                  </>
                )}
                <button
                  onClick={() => setViewingApp(null)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= EDIT REGISTRATION MODAL ================= */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{editingApp.id}</span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Edit Student Registration Details</h3>
              </div>
              <button
                onClick={() => setEditingApp(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={editForm.rollNumber}
                    onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {ALL_FILTER_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Academic Year</label>
                  <select
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {ADMIN_YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {GENDERS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Section</label>
                  <input
                    type="text"
                    value={editForm.section}
                    onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Preferred Sport</label>
                  <select
                    value={editForm.preferredSports}
                    onChange={(e) => setEditForm({ ...editForm, preferredSports: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {AVAILABLE_SPORTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Review Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved (Move to Memberships)</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

              </div>

              {/* Playing Experience Section */}
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2">
                <label className="block text-[var(--text-secondary)] font-semibold">Playing Experience</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editPlayingExperience"
                      value="No Previous Experience"
                      checked={editForm.playingExperience === 'No Previous Experience'}
                      onChange={() => setEditForm({ ...editForm, playingExperience: 'No Previous Experience' })}
                      className="accent-[#0d3a73]"
                    />
                    <span>No Previous Experience</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editPlayingExperience"
                      value="Have Playing Experience"
                      checked={editForm.playingExperience === 'Have Playing Experience'}
                      onChange={() => setEditForm({ ...editForm, playingExperience: 'Have Playing Experience' })}
                      className="accent-[#0d3a73]"
                    />
                    <span>Have Playing Experience</span>
                  </label>
                </div>

                {editForm.experienceCertificateUrl && (
                  <div className="pt-2 flex items-center justify-between border-t border-[var(--border-color)] mt-2">
                    <span className="text-[11px] text-[var(--text-muted)]">Certificate file attached:</span>
                    <a
                      href={editForm.experienceCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Current PDF</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Directorate Remarks</label>
                <input
                  type="text"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  placeholder="Review comments or notes..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white transition-all cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Delete Registration</h3>
                <p className="text-xs text-[var(--text-muted)]">This will permanently delete {deletingApp.name}'s application.</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Are you sure you want to permanently delete registration <strong className="font-mono text-blue-600 dark:text-blue-400">{deletingApp.id}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-sm"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
