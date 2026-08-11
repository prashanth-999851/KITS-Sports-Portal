import React, { useState } from 'react';
import { X, CheckCircle2, Trophy, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

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
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    } catch (err) {}
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ name: "", rollNumber: "", department: "CSE", year: "1st Year", email: "", phone: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-8 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-6">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto" />
            <h3 className="text-2xl font-extrabold text-white">Registration Confirmed!</h3>
            <p className="text-xs text-slate-300">
              You are now registered for <strong className="text-amber-400">{targetName}</strong>.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-amber-400 text-xl font-bold">
              ID: {trackingId}
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Trophy className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-xl font-extrabold text-white">Register for {targetName}</h3>
                <span className="text-xs text-amber-400 font-semibold">KKR & KSR Official Trials 2026</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M. Sai Charan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="23KK1A0589"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
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
                  <label className="block text-slate-300 mb-1 font-semibold">Institute Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@kkrksr.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Registration</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
