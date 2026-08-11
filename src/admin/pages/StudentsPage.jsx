import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { Users, Search, Plus, Download, CheckCircle, XCircle, Ban, Edit, Trash2, X, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function StudentsPage() {
  const { applications, updateApplicationStatus, deleteApplication, addStudentApplication } = useConvexState();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: 'CSE',
    year: '1st Year',
    section: 'A',
    email: '',
    phone: '',
    gender: 'Male',
    preferredSports: ['Cricket']
  });

  const filteredStudents = applications.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addStudentApplication(formData);
    setShowAddModal(false);
    setFormData({ name: '', rollNumber: '', department: 'CSE', year: '1st Year', section: 'A', email: '', phone: '', gender: 'Male', preferredSports: ['Cricket'] });
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("KKR & KSR Institute Sports Directorate - Student Registrations", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    let y = 32;
    doc.setFontSize(9);
    doc.text("ID | Name | Roll No | Department | Sports | Status", 14, y);
    y += 6;
    doc.line(14, y, 195, y);
    y += 6;

    filteredStudents.forEach((st) => {
      const line = `${st.id} | ${st.name} | ${st.rollNumber} | ${st.department} | ${Array.isArray(st.preferredSports) ? st.preferredSports.join(',') : st.preferredSports} | ${st.status}`;
      doc.text(line, 14, y);
      y += 6;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("KITS_Student_Registrations.pdf");
  };

  // Export Excel
  const exportExcel = () => {
    const wsData = filteredStudents.map(s => ({
      ID: s.id,
      Name: s.name,
      RollNumber: s.rollNumber,
      Department: s.department,
      Year: s.year,
      Email: s.email,
      Phone: s.phone,
      Sports: Array.isArray(s.preferredSports) ? s.preferredSports.join(', ') : s.preferredSports,
      Status: s.status,
      AppliedDate: s.appliedDate
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "KITS_Student_Registrations.xlsx");
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Student Registration Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Full CRUD, approvals, status controls, and PDF/Excel exporting.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>

          <button
            onClick={exportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <FileText className="w-3.5 h-3.5 text-red-500" />
            <span>PDF</span>
          </button>

          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search student, roll number, email..."
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
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="Mechanical">Mechanical</option>
          <option value="Civil">Civil</option>
          <option value="IT">IT</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] uppercase font-bold border-b border-[var(--border-color)]">
              <tr>
                <th className="p-3">App ID</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Roll & Dept</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Sports Preference</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-[var(--bg-card-subtle)]">
                  <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{st.id}</td>
                  <td className="p-3 font-bold text-[var(--text-primary)]">{st.name}</td>
                  <td className="p-3">{st.rollNumber} ({st.department} - {st.year})</td>
                  <td className="p-3">{st.email}<br /><span className="text-[var(--text-muted)]">{st.phone}</span></td>
                  <td className="p-3">{Array.isArray(st.preferredSports) ? st.preferredSports.join(", ") : st.preferredSports}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      st.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                      st.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30' :
                      st.status === 'Suspended' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30' :
                      'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                    }`}>
                      {st.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    {st.status !== 'Approved' && (
                      <button
                        onClick={() => updateApplicationStatus(st.id, 'Approved', 'Approved by Physical Education Desk')}
                        className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-500"
                        title="Approve Student"
                      >
                        Approve
                      </button>
                    )}
                    {st.status !== 'Rejected' && (
                      <button
                        onClick={() => updateApplicationStatus(st.id, 'Rejected', 'Application rejected')}
                        className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-500"
                        title="Reject Student"
                      >
                        Reject
                      </button>
                    )}
                    {st.status !== 'Suspended' && (
                      <button
                        onClick={() => updateApplicationStatus(st.id, 'Suspended', 'Student suspended due to attendance')}
                        className="px-2 py-1 rounded bg-purple-600 text-white text-[10px] font-bold hover:bg-purple-500"
                        title="Suspend Student"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => deleteApplication(st.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Add Student Registration</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Student Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Roll Number *</label>
                  <input type="text" required value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Department *</label>
                  <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className={inputClass}>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="IT">IT</option>
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

              <button type="submit" className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]">
                Create Registration Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
