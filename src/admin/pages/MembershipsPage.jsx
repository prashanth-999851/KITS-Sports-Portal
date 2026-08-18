import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { TableRowSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { UserCheck, Edit, Trash2, Search, Filter, X, Download, RotateCcw, FileSpreadsheet, AlertTriangle, ShieldCheck, Plus, UserPlus } from 'lucide-react';
import * as XLSX from 'xlsx';

import { 
  ADMIN_ACADEMIC_YEARS, 
  getAvailableDepartments, 
  getAvailableSections 
} from '../../constants/academicRules';

const ALL_FILTER_DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'CAI', 'CSM', 'CSD'];
const ADMIN_YEARS = ADMIN_ACADEMIC_YEARS;
const AVAILABLE_SPORTS = ['Cricket', 'Volleyball', 'Basketball', 'Badminton', 'Kabaddi', 'Kho-Kho', 'Netball', 'Ball-Badminton', 'Athletics'];
const STATUSES = ['Pending', 'Approved', 'Rejected', 'Suspended'];
const GENDERS = ['Male', 'Female'];

export default function MembershipsPage() {
  const { applications, updateApplicationStatus, updateApplication, deleteApplication, addStudentApplication, isLoading } = useConvexState();

  // Enterprise Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [sportFilter, setSportFilter] = useState('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deletingApp, setDeletingApp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add New Membership (Admin)
  const [addForm, setAddForm] = useState({
    name: '',
    rollNumber: '',
    department: 'CSE',
    year: '2nd Year',
    section: 'Section 1',
    gender: 'Male',
    email: '',
    phone: '',
    preferredSports: 'Cricket',
    status: 'Approved',
    remarks: '', // No default value
  });

  // Form State for Editing Membership
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
    status: 'Pending',
    remarks: '',
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setDeptFilter('All');
    setYearFilter('All');
    setGenderFilter('All');
    setSportFilter('All');
  };

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
      status: app.status || 'Pending',
      remarks: app.remarks || '',
    });
  };

  const handleCreateMembership = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.rollNumber) return;
    setIsSubmitting(true);
    try {
      const generatedId = await addStudentApplication({
        name: addForm.name,
        rollNumber: addForm.rollNumber,
        department: addForm.department,
        year: addForm.year,
        section: addForm.section,
        gender: addForm.gender,
        email: addForm.email,
        phone: addForm.phone,
        preferredSports: [addForm.preferredSports],
        status: addForm.status,
        remarks: addForm.remarks,
      });

      if (generatedId && addForm.status !== 'Pending') {
        await updateApplicationStatus(generatedId, addForm.status, addForm.remarks);
      }

      setShowAddModal(false);
      setAddForm({
        name: '',
        rollNumber: '',
        department: 'CSE',
        year: '2nd Year',
        section: 'Section 1',
        gender: 'Male',
        email: '',
        phone: '',
        preferredSports: 'Cricket',
        status: 'Approved',
        remarks: '',
      });
    } catch (err) {
      alert("Error adding membership: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingApp) return;
    setIsSubmitting(true);
    try {
      await updateApplication(editingApp.id, {
        ...editForm,
        preferredSports: [editForm.preferredSports]
      });
      setEditingApp(null);
    } catch (err) {
      alert("Error updating application: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingApp) return;
    setIsSubmitting(true);
    try {
      await deleteApplication(deletingApp.id);
      setDeletingApp(null);
    } catch (err) {
      alert("Error deleting application: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered applications logic
  const filteredApps = applications.filter(app => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (app.id && app.id.toLowerCase().includes(query)) ||
      (app.name && app.name.toLowerCase().includes(query)) ||
      (app.rollNumber && app.rollNumber.toLowerCase().includes(query)) ||
      (app.email && app.email.toLowerCase().includes(query)) ||
      (app.phone && app.phone.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
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

  const activeFilterCount = (statusFilter !== 'All' ? 1 : 0) + 
                            (deptFilter !== 'All' ? 1 : 0) + 
                            (yearFilter !== 'All' ? 1 : 0) + 
                            (genderFilter !== 'All' ? 1 : 0) + 
                            (sportFilter !== 'All' ? 1 : 0) + 
                            (searchQuery ? 1 : 0);

  // Enterprise Export to Excel
  const handleExportToExcel = () => {
    if (filteredApps.length === 0) {
      alert("No membership records match the current filter criteria to export.");
      return;
    }

    const exportData = filteredApps.map(app => ({
      "Tracking ID": app.id || '',
      "Student Name": app.name || '',
      "Roll Number": app.rollNumber || '',
      "Department": app.department || '',
      "Academic Year": app.year || '',
      "Section": app.section || '',
      "Gender": app.gender || 'Male',
      "Email Address": app.email || '',
      "Phone Number": app.phone || '',
      "Preferred Sport": Array.isArray(app.preferredSports) ? app.preferredSports.join(", ") : (app.preferredSports || ''),
      "Review Status": app.status || 'Pending',
      "Applied Date": app.appliedDate || '',
      "Directorate Remarks": app.remarks || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    worksheet['!cols'] = [
      { wch: 16 }, // Tracking ID
      { wch: 25 }, // Student Name
      { wch: 15 }, // Roll Number
      { wch: 14 }, // Department
      { wch: 14 }, // Academic Year
      { wch: 12 }, // Section
      { wch: 10 }, // Gender
      { wch: 28 }, // Email
      { wch: 16 }, // Phone
      { wch: 22 }, // Preferred Sport
      { wch: 14 }, // Status
      { wch: 14 }, // Applied Date
      { wch: 45 }, // Remarks
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Memberships");

    const dateTag = new Date().toISOString().split('T')[0];
    const fileName = `KITS_Sports_Memberships_${dateTag}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Membership Approvals & Data Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Enterprise portal to add, review, filter, edit, delete, and export student sports club registrations.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Add Membership Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Membership</span>
          </button>

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-semibold">Approved Members</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{applications.filter(a => a.status === 'Approved').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-semibold">Pending Review</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{applications.filter(a => a.status === 'Pending').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-semibold">Rejected / Suspended</span>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{applications.filter(a => a.status === 'Rejected' || a.status === 'Suspended').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-semibold">Filtered Output</span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredApps.length} <span className="text-xs text-[var(--text-muted)] font-normal">/ {applications.length} total</span></p>
        </div>
      </div>

      {/* Main Content Area with Enterprise Filters */}
      <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
        
        {/* Enterprise Multi-Filter Toolbar */}
        <div className="space-y-3 pb-2 border-b border-[var(--border-color)]">
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search student name, roll number, tracking ID, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Reset Filters & Active Badge */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-500/30">
                  {activeFilterCount} Active {activeFilterCount === 1 ? 'Filter' : 'Filters'}
                </span>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              </div>
            )}

          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            
            {/* 1. Status Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* 2. Department Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
              >
                <option value="All">All Departments</option>
                {ALL_FILTER_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* 3. Year Filter (Admin: 2nd, 3rd, 4th Years) */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Academic Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
              >
                <option value="All">All Years</option>
                {ADMIN_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* 4. Gender Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
              >
                <option value="All">All Genders</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* 5. Sport Preference Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Sport Discipline</label>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
              >
                <option value="All">All Sports</option>
                {AVAILABLE_SPORTS.map(sp => <option key={sp} value={sp}>{sp}</option>)}
              </select>
            </div>

          </div>

        </div>

        {/* Memberships Table */}
        {isLoading ? (
          <TableRowSkeleton rows={5} />
        ) : filteredApps.length === 0 ? (
          <EmptyState
            title="No Membership Records Found"
            description={activeFilterCount > 0 ? "No student applications match the active filter combination. Try resetting your filters." : "There are currently no student membership applications in the database."}
            icon={UserCheck}
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
                  <th className="p-3">Contact Email & Phone</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{app.id}</td>
                    <td className="p-3 font-bold text-[var(--text-primary)]">{app.name}</td>
                    <td className="p-3 whitespace-nowrap">
                      <div>{app.rollNumber}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{app.department} • {app.year}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold">{app.gender || 'Male'}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{app.section || 'N/A'}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-[11px]">
                        {Array.isArray(app.preferredSports) ? app.preferredSports.join(", ") : app.preferredSports}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div>{app.email}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{app.phone}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                        app.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30' :
                        app.status === 'Suspended' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30' :
                        'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Quick Approve / Reject for Pending */}
                        {app.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'Approved', 'Membership approved by Physical Education Desk')}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
                              title="Approve Membership"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'Rejected', 'Membership application rejected')}
                              className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
                              title="Reject Application"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="p-1.5 rounded-lg bg-[var(--bg-card-subtle)] text-blue-600 dark:text-blue-400 border border-[var(--border-color)] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                          title="Edit Application Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingApp(app)}
                          className="p-1.5 rounded-lg bg-[var(--bg-card-subtle)] text-red-600 dark:text-red-400 border border-[var(--border-color)] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Application Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ================= ADD MEMBERSHIP MODAL (ADMIN) ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Add New Student Membership</h3>
                  <span className="text-xs text-[var(--text-muted)]">Admin Direct Student Registration</span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Form */}
            <form onSubmit={handleCreateMembership} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Name */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter student full name"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Roll Number */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter roll number"
                    value={addForm.rollNumber}
                    onChange={(e) => setAddForm({ ...addForm, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Year (2nd, 3rd, 4th Years enabled) */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Academic Year *</label>
                  <select
                    value={addForm.year}
                    onChange={(e) => {
                      const newYear = e.target.value;
                      const depts = getAvailableDepartments(newYear);
                      const newDept = depts.includes(addForm.department) ? addForm.department : 'CSE';
                      const secs = getAvailableSections(newYear, newDept);
                      const curSecNum = (addForm.section || '').replace('Section ', '');
                      const newSecNum = secs.includes(curSecNum) ? curSecNum : secs[0];
                      setAddForm({ ...addForm, year: newYear, department: newDept, section: `Section ${newSecNum}` });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold focus:border-blue-500 focus:outline-none"
                  >
                    {ADMIN_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* Department (Dynamic based on year) */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Department *</label>
                  <select
                    value={addForm.department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      const secs = getAvailableSections(addForm.year, newDept);
                      const curSecNum = (addForm.section || '').replace('Section ', '');
                      const newSecNum = secs.includes(curSecNum) ? curSecNum : secs[0];
                      setAddForm({ ...addForm, department: newDept, section: `Section ${newSecNum}` });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  >
                    {getAvailableDepartments(addForm.year).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Section (Dynamic based on year & department) */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Section *</label>
                  <select
                    value={addForm.section}
                    onChange={(e) => setAddForm({ ...addForm, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  >
                    {getAvailableSections(addForm.year, addForm.department).map(sec => (
                      <option key={sec} value={`Section ${sec}`}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Gender *</label>
                  <select
                    value={addForm.gender}
                    onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Email */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-semibold text-[var(--text-secondary)]">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter phone number"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Preferred Sport Single Selection */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Preferred Sport Discipline *</label>
                  <select
                    value={addForm.preferredSports}
                    onChange={(e) => setAddForm({ ...addForm, preferredSports: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold focus:border-blue-500 focus:outline-none"
                  >
                    {AVAILABLE_SPORTS.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                  </select>
                </div>
              </div>

              {/* Status & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Initial Status *</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-bold text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Directorate Remarks</label>
                  <input
                    type="text"
                    placeholder="Enter directorate remarks"
                    value={addForm.remarks}
                    onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Register Student Membership'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT MEMBERSHIP MODAL ================= */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Edit Membership Application</h3>
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">{editingApp.id}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingApp(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Name */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter student full name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Roll Number */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter roll number"
                    value={editForm.rollNumber}
                    onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Year (2nd, 3rd, 4th Years) */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Academic Year *</label>
                  <select
                    value={editForm.year}
                    onChange={(e) => {
                      const newYear = e.target.value;
                      const depts = getAvailableDepartments(newYear);
                      const newDept = depts.includes(editForm.department) ? editForm.department : 'CSE';
                      const secs = getAvailableSections(newYear, newDept);
                      const curSecNum = (editForm.section || '').replace('Section ', '');
                      const newSecNum = secs.includes(curSecNum) ? curSecNum : secs[0];
                      setEditForm({ ...editForm, year: newYear, department: newDept, section: `Section ${newSecNum}` });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold focus:border-blue-500 focus:outline-none"
                  >
                    {ADMIN_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* Department (Dynamic based on year) */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Department *</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      const secs = getAvailableSections(editForm.year, newDept);
                      const curSecNum = (editForm.section || '').replace('Section ', '');
                      const newSecNum = secs.includes(curSecNum) ? curSecNum : secs[0];
                      setEditForm({ ...editForm, department: newDept, section: `Section ${newSecNum}` });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  >
                    {getAvailableDepartments(editForm.year).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Section (Dynamic based on year & department) */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Section *</label>
                  <select
                    value={editForm.section}
                    onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  >
                    {getAvailableSections(editForm.year, editForm.department).map(sec => (
                      <option key={sec} value={`Section ${sec}`}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Gender *</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Email */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-semibold text-[var(--text-secondary)]">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter phone number"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Preferred Sport Single Selection */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Preferred Sport Discipline *</label>
                  <select
                    value={editForm.preferredSports}
                    onChange={(e) => setEditForm({ ...editForm, preferredSports: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold focus:border-blue-500 focus:outline-none"
                  >
                    {AVAILABLE_SPORTS.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                  </select>
                </div>
              </div>

              {/* Status & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Application Review Status *</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-bold text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[var(--text-secondary)]">Directorate Remarks</label>
                  <input
                    type="text"
                    placeholder="Enter directorate remarks"
                    value={editForm.remarks}
                    onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-lg font-semibold bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-[var(--bg-card)] border border-red-500/30 shadow-2xl space-y-4">
            
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 rounded-full bg-red-50 dark:bg-red-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Confirm Deletion</h3>
                <p className="text-xs text-[var(--text-muted)]">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs space-y-1.5">
              <p className="font-semibold text-red-900 dark:text-red-300">Are you sure you want to permanently delete this membership application?</p>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 space-y-0.5">
                <div><strong className="text-[var(--text-primary)]">Tracking ID:</strong> <span className="font-mono">{deletingApp.id}</span></div>
                <div><strong className="text-[var(--text-primary)]">Student Name:</strong> {deletingApp.name} ({deletingApp.rollNumber})</div>
                <div><strong className="text-[var(--text-primary)]">Department:</strong> {deletingApp.department} • {deletingApp.year} • {deletingApp.gender}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
                className="px-4 py-2 rounded-lg font-semibold text-xs bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-lg font-bold text-xs bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Application'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
