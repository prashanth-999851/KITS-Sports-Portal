import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { ButtonSpinner } from './LoadingSkeleton';
import { CheckCircle2, AlertCircle, FileText, Send } from 'lucide-react';

const DEFAULT_SPORTS = [
  "Cricket", "Volleyball", "Basketball", "Badminton",
  "Football", "Kabaddi", "Table Tennis", "Chess",
  "Athletics", "Throwball", "Kho-Kho"
];

export default function MembershipPortal({ applications, onAddApplication }) {
  const { sports: rawSports = [] } = useConvexState();
  const [activeTab, setActiveTab] = useState("Apply");
  const [trackingCode, setTrackingCode] = useState("");
  const [trackedApp, setTrackedApp] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [submittedCode, setSubmittedCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Merge loaded sports with fallback to ensure options are always available
  const availableSports = rawSports.length > 0 
    ? rawSports.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)
    : DEFAULT_SPORTS;

  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    department: "CSE",
    year: "2nd Year",
    gender: "Male",
    section: "Section 1",
    email: "",
    phone: "",
    selectedSport: ""
  });

  const handleSportSelect = (sportName) => {
    setFormData(prev => ({ ...prev, selectedSport: sportName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedSport) {
      alert("Please select your preferred sport discipline.");
      return;
    }

    setIsSubmitting(true);
    try {
      const trackingId = await onAddApplication({
        name: formData.name,
        rollNumber: formData.rollNumber,
        department: formData.department,
        year: formData.year,
        gender: formData.gender || "Male",
        section: formData.section || "Section 1",
        email: formData.email,
        phone: formData.phone,
        preferredSports: [formData.selectedSport]
      });
      setSubmittedCode(trackingId || `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setFormData({
        name: "",
        rollNumber: "",
        department: "CSE",
        year: "2nd Year",
        gender: "Male",
        section: "Section 1",
        email: "",
        phone: "",
        selectedSport: ""
      });
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { students = [] } = useConvexState();

  const handleTrackSearch = (e) => {
    e.preventDefault();
    setSearchAttempted(true);
    const code = trackingCode.toLowerCase().trim();
    
    // Check applications first
    const foundApp = applications.find(a => 
      (a.id && a.id.toLowerCase().trim() === code) || 
      (a.rollNumber && a.rollNumber.toLowerCase().trim() === code)
    );

    if (foundApp) {
      setTrackedApp(foundApp);
      return;
    }

    // Check master students roster next
    const foundStudent = students.find(s => 
      (s.rollNumber && s.rollNumber.toLowerCase().trim() === code) ||
      (s.email && s.email.toLowerCase().trim() === code)
    );

    if (foundStudent) {
      setTrackedApp({
        id: foundStudent.rollNumber,
        name: foundStudent.name,
        rollNumber: foundStudent.rollNumber,
        department: foundStudent.department,
        year: foundStudent.year,
        preferredSports: [foundStudent.sportId],
        status: foundStudent.status === 'Active' ? 'Approved' : foundStudent.status,
        remarks: `Official registered athlete in ${foundStudent.sportId} squad. Status: ${foundStudent.status}.`
      });
    } else {
      setTrackedApp(null);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors";

  return (
    <section id="membership" className="py-12 sm:py-16 bg-[var(--bg-card-subtle)] transition-colors">
      <div className="section-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)] dark:text-blue-400">Student Gateway</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] section-accent">
            Membership <span className="accent-text">Portal</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed pt-2">
            Register as an official Sports Club member, select your sports preferences, and track application status.
          </p>

          {/* Tabs */}
          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab("Apply")}
              className={`px-5 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                activeTab === "Apply" 
                  ? 'bg-[#0d3a73] text-white shadow-md shadow-blue-900/20' 
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] hover:shadow-sm'
              }`}
            >
              Apply for Membership
            </button>
            <button
              onClick={() => setActiveTab("Track")}
              className={`px-5 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                activeTab === "Track" 
                  ? 'bg-[#0d3a73] text-white shadow-md shadow-blue-900/20' 
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] hover:shadow-sm'
              }`}
            >
              Track Application
            </button>
          </div>
        </div>

        {/* Apply Form */}
        {activeTab === "Apply" && (
          <div className="max-w-3xl mx-auto p-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
            
            {submittedCode ? (
              <div className="p-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Application Submitted Successfully!</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Your application has been logged into the Physical Education Department database.
                </p>
                <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] inline-block">
                  <span className="text-xs text-[var(--text-muted)]">Application Tracking ID:</span>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400 tracking-wider font-mono">{submittedCode}</p>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Save this code to check your trial schedule and approval status.</p>
                
                <button
                  onClick={() => setSubmittedCode(null)}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#0d3a73] text-white hover:bg-[#104a8e] transition-colors"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Student Registration Form</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Full Name *</label>
                    <input
                      type="text" required placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Roll Number *</label>
                    <input
                      type="text" required placeholder="Enter your roll number"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Year of Study *</label>
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
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Department *</label>
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
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Gender *</label>
                    <select
                      value={formData.gender || "Male"}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Section *</label>
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
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Institute Email *</label>
                    <input
                      type="email" required placeholder="Enter your institutional email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Phone Number *</label>
                    <input
                      type="tel" required placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Sport Selection */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                      Select Preferred Sport <span className="text-[var(--text-muted)] font-normal">(Choose 1 discipline)</span> *
                    </label>
                    {formData.selectedSport && (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Selected: {formData.selectedSport}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {availableSports.map((sportName, idx) => {
                      const selected = formData.selectedSport === sportName;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSportSelect(sportName)}
                          className={`p-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                            selected
                              ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/40 font-bold scale-[1.02]'
                              : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]'
                          }`}
                        >
                          <span className="truncate">{sportName}</span>
                          {selected ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 ml-1.5"></span>
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full border border-[var(--border-color)] shrink-0 ml-1.5"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg text-sm font-semibold bg-[#0d3a73] hover:bg-[#104a8e] disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <ButtonSpinner text="Submitting Application..." />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Track Tab */}
        {activeTab === "Track" && (
          <div className="max-w-2xl mx-auto p-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-5">
            <h3 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">Track Application Status</h3>
            <p className="text-xs text-[var(--text-muted)]">Enter your Application Tracking ID or Student Roll Number to view trial dates & approval status.</p>

            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <input
                type="text" required placeholder="Enter Application ID or Roll No."
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className={`flex-1 uppercase font-mono tracking-wider ${inputClass}`}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg font-semibold text-xs bg-[#0d3a73] text-white hover:bg-[#104a8e] transition-colors"
              >
                Search
              </button>
            </form>

            {searchAttempted && (
              <div className="pt-4 border-t border-[var(--border-color)]">
                {trackedApp ? (
                  <div className="p-5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-[var(--text-muted)]">{trackedApp.id}</span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        trackedApp.status === 'Approved' 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                      }`}>
                        {trackedApp.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-[var(--text-primary)]">{trackedApp.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)]">{trackedApp.rollNumber} • {trackedApp.department} ({trackedApp.year})</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Sports: {trackedApp.preferredSports.join(", ")}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                      <span className="font-bold text-[var(--text-primary)] block mb-0.5">Remarks:</span>
                      <p>{trackedApp.remarks}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-center space-y-2">
                    <AlertCircle className="w-7 h-7 text-red-500 mx-auto" />
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400">No application found for '{trackingCode}'</p>
                    <p className="text-xs text-[var(--text-muted)]">Please check your code or apply using the form.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
