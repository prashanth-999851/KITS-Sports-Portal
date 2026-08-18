import React, { useState, useEffect } from 'react';
import { ButtonSpinner } from './LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { X, CheckCircle2, Trophy, Send } from 'lucide-react';

export default function RegistrationModal({ sportName, eventName, isOpen, onClose, onAddApplication }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    department: "CSE",
    year: "2nd Year",
    gender: "Male",
    section: "Section 1",
    email: "",
    phone: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock background body scroll when popup modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle || 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetName = sportName || eventName || "Sports Club";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const generatedId = await onAddApplication({
        ...formData,
        preferredSports: [targetName],
      });
      setTrackingId(generatedId || `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitted(true);
      showToast(`Registration submitted for ${targetName}!`, 'success');
    } catch (err) {
      console.error("Registration error:", err);
      showToast('Registration failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ name: "", rollNumber: "", department: "CSE", year: "1st Year", email: "", phone: "" });
    onClose();
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:border-[#0b2e5b] focus:bg-white focus:outline-none transition-colors";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-5 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="p-4 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">Registration Confirmed!</h3>
            <p className="text-xs text-slate-600">
              You are now registered for <strong className="text-[#0b2e5b]">{targetName}</strong>.
            </p>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[#0b2e5b] text-lg font-bold">
              ID: {trackingId}
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-lg font-bold text-xs bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-colors cursor-pointer shadow-sm"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0b2e5b]">Register for {targetName}</h3>
                <span className="text-[11px] text-slate-500 font-medium">KKR & KSR Official Trials 2026</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Student Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Year of Study *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => {
                      const newYear = e.target.value;
                      const validDepts = newYear === '4th Year' 
                        ? ['CSE', 'IT', 'ECE', 'EEE', 'CAI', 'CSM', 'CSD']
                        : ['CSE', 'IT', 'ECE', 'EEE', 'CSM', 'CSD'];
                      const newDept = validDepts.includes(formData.department) ? formData.department : 'CSE';
                      setFormData({ ...formData, year: newYear, department: newDept });
                    }}
                    className={inputClass}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={inputClass}
                  >
                    {(formData.year === '4th Year' 
                      ? ['CSE', 'IT', 'ECE', 'EEE', 'CAI', 'CSM', 'CSD']
                      : ['CSE', 'IT', 'ECE', 'EEE', 'CSM', 'CSD']
                    ).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Roll Number *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter your roll number"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Gender *</label>
                  <select
                    value={formData.gender || "Male"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Section *</label>
                  <select
                    value={formData.section || "Section 1"}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className={inputClass}
                  >
                    {(formData.department === 'CSE' ? ['1','2','3','4','5','6','7','8'] :
                      formData.department === 'IT' ? ['1','2'] :
                      formData.department === 'CSM' ? ['1','2','3','4','5','6'] :
                      formData.department === 'EEE' ? ['1'] : ['1','2','3']).map(sec => (
                      <option key={sec} value={`Section ${sec}`}>Section {sec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Phone *</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Email Address *</label>
                <input 
                  type="email" 
                  required 
                  placeholder="student@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg font-bold text-xs bg-[#0b2e5b] hover:bg-[#0d3a73] disabled:opacity-50 text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <ButtonSpinner text="Registering..." />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Registration</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
