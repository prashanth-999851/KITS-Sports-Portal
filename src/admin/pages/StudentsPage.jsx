import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { TableRowSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { 
  Users, Search, Plus, CheckCircle, XCircle, Edit, Trash2, X, 
  MoreVertical, FileSpreadsheet, FileText, UserCheck, Shield, Filter
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Department & Section Configuration
export const BASE_DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'CSM', 'CSD'];

export function getDepartmentsForYear(year) {
  if (year === '4th Year') {
    return ['CSE', 'IT', 'ECE', 'EEE', 'CAI', 'CSM', 'CSD'];
  }
  return ['CSE', 'IT', 'ECE', 'EEE', 'CSM', 'CSD'];
}

export function getSectionsForDeptAndYear(dept, year) {
  // If 4th Year, CSM has 1 section, others have 3 sections
  if (year === '4th Year') {
    if (dept === 'CSM') return ['1'];
    return ['1', '2', '3'];
  }
  
  // 2nd Year & 3rd Year rules:
  if (dept === 'CSE') return ['1', '2', '3', '4', '5', '6', '7', '8'];
  if (dept === 'IT') return ['1', '2'];
  if (dept === 'CSM') {
    if (year === '2nd Year') return ['1', '2', '3', '4', '5', '6'];
    if (year === '3rd Year') return ['1', '2', '3'];
    return ['1', '2', '3'];
  }
  if (dept === 'EEE') return ['1'];
  if (dept === 'ECE') return ['1', '2', '3'];
  if (dept === 'CSD') return ['1', '2', '3'];
  if (dept === 'CAI') return ['1', '2', '3'];
  return ['1', '2', '3'];
}

export default function StudentsPage() {
  const { 
    students = [], 
    applications = [], 
    sports: SPORTS_LIST = [], 
    addStudentMaster,
    updateStudentMaster,
    deleteStudentMaster,
    updateApplicationStatus, 
    deleteApplication, 
    addStudentApplication, 
    isLoading 
  } = useConvexState();
  
  const [activeTab, setActiveTab] = useState('registered'); // 'registered' | 'applications'
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: 'CSE',
    year: '2nd Year',
    section: '1',
    email: '',
    phone: '',
    gender: 'Male',
    sportId: 'Cricket',
    status: 'Active',
    preferredSports: []
  });

  // Dynamic available departments based on current year selection (CAI only on 4th Year)
  const availableDepartments = getDepartmentsForYear(formData.year);

  // Dynamic available sections based on current formData selection
  const availableSections = getSectionsForDeptAndYear(formData.department, formData.year);

  const handleDeptChange = (newDept) => {
    const newSections = getSectionsForDeptAndYear(newDept, formData.year);
    setFormData(prev => ({
      ...prev,
      department: newDept,
      section: newSections.includes(prev.section) ? prev.section : newSections[0]
    }));
  };

  const handleYearChange = (newYear) => {
    const validDepts = getDepartmentsForYear(newYear);
    const newDept = validDepts.includes(formData.department) ? formData.department : 'CSE';
    const newSections = getSectionsForDeptAndYear(newDept, newYear);
    setFormData(prev => ({
      ...prev,
      year: newYear,
      department: newDept,
      section: newSections.includes(prev.section) ? prev.section : newSections[0]
    }));
  };

  const handleSportToggle = (sportName) => {
    setFormData(prev => {
      const exists = prev.preferredSports.includes(sportName);
      if (exists) {
        return { ...prev, preferredSports: prev.preferredSports.filter(s => s !== sportName) };
      } else {
        return { ...prev, preferredSports: [...prev.preferredSports, sportName] };
      }
    });
  };

  // Filter items
  const registeredFiltered = students.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
                          (s.name && s.name.toLowerCase().includes(term)) || 
                          (s.rollNumber && s.rollNumber.toLowerCase().includes(term)) ||
                          (s.email && s.email.toLowerCase().includes(term)) ||
                          (s.phone && s.phone.toLowerCase().includes(term));
    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const applicationsFiltered = applications.filter(a => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
                          (a.name && a.name.toLowerCase().includes(term)) || 
                          (a.rollNumber && a.rollNumber.toLowerCase().includes(term)) ||
                          (a.email && a.email.toLowerCase().includes(term));
    const matchesDept = departmentFilter === 'All' || a.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'registered') {
      if (editingItem) {
        await updateStudentMaster(editingItem.id, formData);
      } else {
        await addStudentMaster(formData);
      }
    } else {
      if (formData.preferredSports.length === 0) {
        alert("Please select at least one preferred sport.");
        return;
      }
      if (editingItem) {
        await deleteApplication(editingItem.id);
        await addStudentApplication({ ...formData, id: editingItem.id, status: editingItem.status });
      } else {
        await addStudentApplication(formData);
      }
    }
    setShowAddModal(false);
    setEditingItem(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rollNumber: '',
      department: 'CSE',
      year: '2nd Year',
      section: '1',
      email: '',
      phone: '',
      gender: 'Male',
      sportId: 'Cricket',
      status: 'Active',
      preferredSports: []
    });
  };

  // Metrics
  const totalRegisteredCount = students.length;
  const pendingAppsCount = applications.filter(a => a.status === 'Pending').length;
  const approvedCount = applications.filter(a => a.status === 'Approved').length + students.length;
  const totalDeptCount = 7;

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const isRegistered = activeTab === 'registered';
    const titleText = isRegistered 
      ? "KKR & KSR Institute Sports Directorate - Registered Student Roster" 
      : "KKR & KSR Institute Sports Directorate - Registration Applications";

    doc.setFontSize(14);
    doc.text(titleText, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    let y = 32;
    doc.setFontSize(9);
    
    if (isRegistered) {
      doc.text("Roll No | Student Name | Dept & Sec | Email | Sport", 14, y);
      y += 6;
      doc.line(14, y, 195, y);
      y += 6;

      registeredFiltered.forEach((st) => {
        const line = `${st.rollNumber} | ${st.name} | ${st.department}-${st.year} (Sec ${st.section}) | ${st.email} | ${st.sportId}`;
        doc.text(line.substring(0, 95), 14, y);
        y += 6;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    } else {
      doc.text("App ID | Student Name | Roll No | Dept | Sports | Status", 14, y);
      y += 6;
      doc.line(14, y, 195, y);
      y += 6;

      applicationsFiltered.forEach((app) => {
        const sportsStr = Array.isArray(app.preferredSports) ? app.preferredSports.join(',') : app.preferredSports;
        const line = `${app.id} | ${app.name} | ${app.rollNumber} | ${app.department} | ${sportsStr} | ${app.status}`;
        doc.text(line.substring(0, 95), 14, y);
        y += 6;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    }

    doc.save(isRegistered ? "KITS_Registered_Students_Roster.pdf" : "KITS_Student_Applications.pdf");
  };

  // Export Excel
  const exportExcel = () => {
    const isRegistered = activeTab === 'registered';
    let wsData = [];

    if (isRegistered) {
      wsData = registeredFiltered.map(s => ({
        RollNumber: s.rollNumber,
        Name: s.name,
        Department: s.department,
        Year: s.year,
        Section: s.section,
        Email: s.email,
        Phone: s.phone,
        Gender: s.gender,
        AssignedSport: s.sportId,
      }));
    } else {
      wsData = applicationsFiltered.map(a => ({
        TrackingID: a.id,
        Name: a.name,
        RollNumber: a.rollNumber,
        Department: a.department,
        Year: a.year,
        Email: a.email,
        Phone: a.phone,
        PreferredSports: Array.isArray(a.preferredSports) ? a.preferredSports.join(', ') : a.preferredSports,
        Status: a.status,
        AppliedDate: a.appliedDate
      }));
    }

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, isRegistered ? "Registered Students" : "Applications");
    XLSX.writeFile(wb, isRegistered ? "KITS_Registered_Students_Roster.xlsx" : "KITS_Student_Applications.xlsx");
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Student Registration & Roster Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage student profiles, department rosters, registration approvals, and exports.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              resetForm();
              setEditingItem(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student Registration</span>
          </button>

          <button
            onClick={exportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-red-500" />
            <span>PDF</span>
          </button>

          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Registered Students</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)]">{totalRegisteredCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Approved Roster</span>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{approvedCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Pending Requests</span>
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{pendingAppsCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Departments</span>
            <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)]">{totalDeptCount}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('registered')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'registered'
              ? 'border-[#1E3A8A] text-[#1E3A8A] dark:text-blue-400'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Student Registration Roster ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 relative ${
            activeTab === 'applications'
              ? 'border-[#1E3A8A] text-[#1E3A8A] dark:text-blue-400'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Registration Requests ({applications.length})
          {pendingAppsCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-white">
              {pendingAppsCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search student, roll number, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
        >
          <option value="All">All Departments</option>
          {['CSE', 'IT', 'ECE', 'EEE', 'CAI', 'CSM', 'CSD'].map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Main Table */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
        {isLoading ? (
          <TableRowSkeleton rows={6} />
        ) : activeTab === 'registered' ? (
          /* REGISTERED STUDENTS ROSTER TABLE */
          registeredFiltered.length === 0 ? (
            <EmptyState
              title="No Student Registrations Found"
              description="There are currently no registered students matching your search criteria."
              icon={Users}
            />
          ) : (
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] uppercase font-bold border-b border-[var(--border-color)]">
                  <tr>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Dept, Year & Section</th>
                    <th className="p-3">Contact Information</th>
                    <th className="p-3">Sport Discipline</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                  {registeredFiltered.map((st) => (
                    <tr key={st.id} className="hover:bg-[var(--bg-card-subtle)]">
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{st.rollNumber}</td>
                      <td className="p-3 font-bold text-[var(--text-primary)]">{st.name}</td>
                      <td className="p-3">{st.department} • {st.year} <span className="text-[var(--text-muted)] font-mono">(Sec {st.section})</span></td>
                      <td className="p-3">
                        {st.email}
                        <br />
                        <span className="text-[var(--text-muted)]">{st.phone}</span>
                      </td>
                      <td className="p-3 font-semibold text-blue-700 dark:text-blue-300">{st.sportId}</td>
                      <td className="p-3 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === st.id ? null : st.id)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors border border-transparent hover:border-[var(--border-color)]"
                          title="Actions Menu"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === st.id && (
                          <div className="absolute right-3 top-10 z-50 w-44 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl py-1 text-left text-xs animate-fadeIn">
                            <button
                              onClick={() => {
                                setEditingItem(st);
                                setFormData({
                                  name: st.name,
                                  rollNumber: st.rollNumber,
                                  department: st.department || 'CSE',
                                  year: st.year || '2nd Year',
                                  section: st.section || '1',
                                  email: st.email || '',
                                  phone: st.phone || '',
                                  gender: st.gender || 'Male',
                                  sportId: st.sportId || 'Cricket',
                                  status: st.status || 'Active',
                                  preferredSports: []
                                });
                                setShowAddModal(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] flex items-center gap-2 font-medium"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-500" />
                              <span>Edit Record</span>
                            </button>

                            <button
                              onClick={() => {
                                deleteStudentMaster(st.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Record</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* REGISTRATION APPLICATIONS TABLE */
          applicationsFiltered.length === 0 ? (
            <EmptyState
              title="No Registration Applications Found"
              description="There are currently no student application requests matching your search."
              icon={Users}
            />
          ) : (
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] uppercase font-bold border-b border-[var(--border-color)]">
                  <tr>
                    <th className="p-3">Tracking ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Roll & Dept</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Sports Preference</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                  {applicationsFiltered.map((app) => (
                    <tr key={app.id} className="hover:bg-[var(--bg-card-subtle)]">
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{app.id}</td>
                      <td className="p-3 font-bold text-[var(--text-primary)]">{app.name}</td>
                      <td className="p-3">{app.rollNumber} ({app.department} - {app.year})</td>
                      <td className="p-3">
                        {app.email}
                        <br />
                        <span className="text-[var(--text-muted)]">{app.phone}</span>
                      </td>
                      <td className="p-3">{Array.isArray(app.preferredSports) ? app.preferredSports.join(", ") : app.preferredSports}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          app.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                          app.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30' :
                          'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === app.id ? null : app.id)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors border border-transparent hover:border-[var(--border-color)]"
                          title="Actions Menu"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === app.id && (
                          <div className="absolute right-3 top-10 z-50 w-44 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl py-1 text-left text-xs animate-fadeIn">
                            {app.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    updateApplicationStatus(app.id, 'Approved', 'Approved by Physical Education Desk');
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-[var(--bg-card-subtle)] flex items-center gap-2 font-semibold"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Approve Student</span>
                                </button>

                                <button
                                  onClick={() => {
                                    updateApplicationStatus(app.id, 'Rejected', 'Application rejected');
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-[var(--bg-card-subtle)] flex items-center gap-2 font-semibold border-b border-[var(--border-color)]"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject Student</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                setEditingItem(app);
                                setFormData({
                                  name: app.name,
                                  rollNumber: app.rollNumber,
                                  department: app.department || 'CSE',
                                  year: app.year || '2nd Year',
                                  section: '1',
                                  email: app.email || '',
                                  phone: app.phone || '',
                                  gender: 'Male',
                                  sportId: 'Cricket',
                                  status: app.status || 'Pending',
                                  preferredSports: Array.isArray(app.preferredSports) ? app.preferredSports : [app.preferredSports]
                                });
                                setShowAddModal(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] flex items-center gap-2 font-medium"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-500" />
                              <span>Edit Application</span>
                            </button>

                            <button
                              onClick={() => {
                                deleteApplication(app.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Application</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingItem ? 'Edit Student Registration' : 'Add Student Registration'}
              </h3>
              <button 
                onClick={() => { 
                  setShowAddModal(false); 
                  setEditingItem(null); 
                  resetForm();
                }} 
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Student Full Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Year of Study *</label>
                  <select 
                    value={formData.year} 
                    onChange={(e) => handleYearChange(e.target.value)} 
                    className={inputClass}
                  >
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Department *</label>
                  <select 
                    value={formData.department} 
                    onChange={(e) => handleDeptChange(e.target.value)} 
                    className={inputClass}
                  >
                    {availableDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Roll Number *</label>
                  <input type="text" required value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Section *</label>
                  <select 
                    value={formData.section} 
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })} 
                    className={inputClass}
                  >
                    {availableSections.map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Phone *</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
                </div>
              </div>

              {activeTab === 'registered' ? (
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Primary Sport Discipline</label>
                  <select value={formData.sportId} onChange={(e) => setFormData({ ...formData, sportId: e.target.value })} className={inputClass}>
                    {SPORTS_LIST.map(sport => (
                      <option key={sport.id} value={sport.name}>{sport.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1.5 font-semibold">Select Sports Disciplines * (Select at least 1)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
                    {SPORTS_LIST.map(sport => {
                      const selected = formData.preferredSports.includes(sport.name);
                      return (
                        <button
                          key={sport.id}
                          type="button"
                          onClick={() => handleSportToggle(sport.name)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                            selected
                              ? 'bg-[#1E3A8A] text-white border-blue-700 shadow-sm'
                              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-card-subtle)]'
                          }`}
                        >
                          {selected ? `✓ ${sport.name}` : `+ ${sport.name}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] transition-colors">
                {editingItem ? 'Save Changes' : 'Submit Student Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
