import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function ReportsAdminPage() {
  const { applications, sports, achievements } = useConvexState();
  const [reportType, setReportType] = useState('Registration');

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`KKR & KSR Institute - ${reportType} Official Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    let y = 35;
    if (reportType === 'Registration') {
      doc.text("Student Registrations Summary:", 14, y);
      y += 8;
      applications.forEach((app, i) => {
        doc.text(`${i + 1}. ${app.id} | ${app.name} | ${app.rollNumber} | ${app.department} | ${app.status}`, 14, y);
        y += 6;
      });
    } else if (reportType === 'Sports') {
      sports.forEach((s, i) => {
        doc.text(`${i + 1}. ${s.name} (${s.category}) - Coordinator: ${s.coordinator}`, 14, y);
        y += 6;
      });
    } else {
      doc.text("Achievements & Honors Summary:", 14, y);
      y += 8;
      (achievements.awards || []).forEach((ach, i) => {
        doc.text(`${i + 1}. ${ach.title} - ${ach.recipient} (${ach.category})`, 14, y);
        y += 6;
      });
    }

    doc.save(`KITS_${reportType}_Report.pdf`);
  };

  const generateExcel = () => {
    let wsData = [];
    if (reportType === 'Registration') {
      wsData = applications.map(a => ({ ID: a.id, Name: a.name, RollNumber: a.rollNumber, Department: a.department, Status: a.status }));
    } else if (reportType === 'Sports') {
      wsData = sports.map(s => ({ Name: s.name, Category: s.category, Coordinator: s.coordinator }));
    } else {
      wsData = (achievements.awards || []).map(a => ({ Title: a.title, Recipient: a.recipient, Category: a.category }));
    }

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `KITS_${reportType}_Report.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[var(--border-color)] pb-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Institutional Report Generator</h2>
        <p className="text-xs text-[var(--text-muted)]">Generate exportable PDF, Excel, and CSV reports for administrative compliance.</p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-6 shadow-sm">
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[var(--text-secondary)]">Select Report Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['Registration', 'Sports', 'Achievements'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`p-3 rounded-lg text-xs font-semibold border transition-colors ${
                  reportType === type ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-color)]'
                }`}
              >
                {type} Report
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] space-y-2">
          <h4 className="font-bold text-[var(--text-primary)]">{reportType} Report Preview Metadata</h4>
          <p>Records Included: <strong className="text-[var(--text-primary)]">{reportType === 'Registration' ? applications.length : reportType === 'Sports' ? sports.length : (achievements.awards || []).length} items</strong></p>
          <p>Security Classification: Official Institutional Document</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generatePDF}
            className="flex-1 py-3 rounded-lg text-xs font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-red-400" />
            <span>Generate PDF Report</span>
          </button>

          <button
            onClick={generateExcel}
            className="flex-1 py-3 rounded-lg text-xs font-bold bg-[var(--bg-card-subtle)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-card)] flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Generate Excel Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
