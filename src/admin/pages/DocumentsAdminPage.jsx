import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { FileText, Download, Plus, FileDown, X } from 'lucide-react';

export default function DocumentsAdminPage() {
  const { documents, addDocument } = useConvexState();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Forms',
    size: '1.2 MB',
    type: 'PDF Document',
    version: '1.0'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addDocument(formData);
    setShowModal(false);
    setFormData({ title: '', category: 'Forms', size: '1.2 MB', type: 'PDF Document', version: '1.0' });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Document Center & Repository</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage registration forms, OD requests, travel clearances, version control, and download statistics.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map((doc, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between card-hover">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                {doc.category}
              </span>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">{doc.title}</h4>
              <p className="text-xs text-[var(--text-muted)]">Version: {doc.version || '1.0'} • Size: {doc.size} • Downloads: {doc.downloadCount || 124}</p>
            </div>

            <button
              onClick={() => alert(`Downloading ${doc.title}...`)}
              className="p-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-blue-600 dark:text-blue-400 hover:bg-[#1E3A8A] hover:text-white transition-colors"
            >
              <FileDown className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Upload Document to Repository</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Document Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                    <option value="Forms">Forms</option>
                    <option value="Academic OD">Academic OD</option>
                    <option value="Travel Clearance">Travel Clearance</option>
                    <option value="Rulebook">Rulebook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Version *</label>
                  <input type="text" required value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} className={inputClass} />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]">
                Upload PDF File
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
