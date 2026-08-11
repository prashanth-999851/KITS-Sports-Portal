import React, { useState } from 'react';
import { X, CheckCircle2, Trophy, Send } from 'lucide-react';

export default function RegistrationModal({ sportName, eventName, isOpen, onClose, onAddApplication }) {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    department: "CSE",
    year: "1st Year",
    email: "",
    phone: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  if (!isOpen) return null;

  const targetName = sportName || eventName || "Sports Club";

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setTrackingId(id);

    onAddApplication({
      id,
      ...formData,
      preferredSports: [targetName],
      status: "Pending",
      appliedDate: new Date().toISOString().split('T')[0],
      remarks: `Direct registration for ${targetName}. Practice trial invite sent via SMS.`
    });

    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ name: "", rollNumber: "", department: "CSE", year: "1st Year", email: "", phone: "" });
    onClose();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-7 rounded-xl glass-modal space-y-5">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="p-5 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Registration Confirmed!</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              You are now registered for <strong className="text-blue-700 dark:text-blue-400">{targetName}</strong>.
            </p>
            <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-blue-700 dark:text-blue-400 text-lg font-bold">
              ID: {trackingId}
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-lg font-semibold text-xs bg-[#1E3A8A] text-white hover:bg-[#1E40AF] transition-colors"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[var(--border-color)] pb-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Register for {targetName}</h3>
                <span className="text-xs text-[var(--text-muted)]">KKR & KSR Official Trials 2026</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Student Name *</label>
                <input type="text" required placeholder="e.g. M. Sai Charan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Roll Number *</label>
                  <input type="text" required placeholder="23KK1A0589"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={inputClass}
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="IT">IT</option>
                    <option value="AI&DS">AI&DS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Email *</label>
                  <input type="email" required placeholder="student@kkrksr.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Phone *</label>
                  <input type="tel" required placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg font-semibold text-xs bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Registration</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
