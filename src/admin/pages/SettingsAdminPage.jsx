import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { Settings, Save, CheckCircle } from 'lucide-react';

export default function SettingsAdminPage() {
  const { settings, updateSettings } = useConvexState();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-[var(--border-color)] pb-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">System Configuration & Settings</h2>
        <p className="text-xs text-[var(--text-muted)]">Configure institute branding, contact details, email servers, and portal defaults.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-5 shadow-sm">
        {saved && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Institute Name</label>
          <input
            type="text" required
            value={formData.instituteName}
            onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Campus Address</label>
          <input
            type="text" required
            value={formData.campusAddress}
            onChange={(e) => setFormData({ ...formData, campusAddress: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Official Contact Email</label>
            <input
              type="email" required
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Helpline Phone</label>
            <input
              type="text" required
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save System Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
