import React, { useState } from 'react';
import { SPORTS_LIST } from '../data/mockData';
import { UserCheck, Search, ShieldCheck, CheckCircle2, AlertCircle, FileText, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MembershipPortal({ applications, onAddApplication }) {
  const [activeTab, setActiveTab] = useState("Apply"); // "Apply" or "Track"
  const [trackingCode, setTrackingCode] = useState("");
  const [trackedApp, setTrackedApp] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [submittedCode, setSubmittedCode] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    department: "CSE",
    year: "1st Year",
    email: "",
    phone: "",
    preferredSports: []
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.preferredSports.length === 0) {
      alert("Please select at least one preferred sport.");
      return;
    }

    const randomId = `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp = {
      id: randomId,
      ...formData,
      status: "Pending",
      appliedDate: new Date().toISOString().split('T')[0],
      remarks: "Application received. Physical trial date will be notified via SMS."
    };

    onAddApplication(newApp);
    setSubmittedCode(randomId);

    // Trigger confetti celebration!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      // ignore fallback
    }

    setFormData({
      name: "",
      rollNumber: "",
      department: "CSE",
      year: "1st Year",
      email: "",
      phone: "",
      preferredSports: []
    });
  };

  const handleTrackSearch = (e) => {
    e.preventDefault();
    setSearchAttempted(true);
    const found = applications.find(a => a.id.toLowerCase().trim() === trackingCode.toLowerCase().trim());
    setTrackedApp(found || null);
  };

  return (
    <section id="membership" className="py-20 bg-slate-950 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Student Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold">
            STUDENT <span className="gold-gradient-text">MEMBERSHIP PORTAL</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Register as an official Sports Club member, select your sports preferences, and track application status.
          </p>

          {/* Switcher Tabs */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab("Apply")}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition ${activeTab === "Apply" ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
            >
              Apply for Membership
            </button>
            <button
              onClick={() => setActiveTab("Track")}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition ${activeTab === "Track" ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
            >
              Track Application Status
            </button>
          </div>
        </div>

        {/* Tab 1: Apply Form */}
        {activeTab === "Apply" && (
          <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl space-y-6">
            
            {submittedCode ? (
              <div className="p-8 rounded-2xl bg-slate-950 border border-amber-500/50 text-center space-y-4 animate-fadeIn">
                <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto" />
                <h3 className="text-2xl font-extrabold text-white">Application Submitted Successfully!</h3>
                <p className="text-sm text-slate-300">
                  Your application has been logged into the Physical Education Department database.
                </p>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 inline-block text-left">
                  <span className="text-xs text-slate-400 font-medium">Your Application Tracking ID:</span>
                  <p className="text-2xl font-extrabold text-amber-400 tracking-wider">{submittedCode}</p>
                </div>
                <p className="text-xs text-slate-400">Save this code to check your trial schedule and approval status.</p>
                
                <button
                  onClick={() => setSubmittedCode(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Student Registration Form</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Student Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. M. Sai Charan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number / ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 23KK1A0589"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                    >
                      <option value="CSE">CSE (Computer Science)</option>
                      <option value="ECE">ECE (Electronics & Comm)</option>
                      <option value="EEE">EEE (Electrical & Electronics)</option>
                      <option value="Mechanical">Mechanical Engineering</option>
                      <option value="Civil">Civil Engineering</option>
                      <option value="IT">Information Technology</option>
                      <option value="AI&DS">AI & Data Science</option>
                      <option value="MBA/MCA">MBA / MCA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Year of Study *</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Institute Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@kkrksr.ac.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preferred Sports Multi-select Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Select Preferred Sports (Select 1 or more) *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SPORTS_LIST.map((s) => {
                      const selected = formData.preferredSports.includes(s.name);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSportToggle(s.name)}
                          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                            selected
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span>{s.icon}</span>
                          <span className="truncate">{s.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Membership Application</span>
                </button>
              </form>
            )}

          </div>
        )}

        {/* Tab 2: Track Application Status */}
        {activeTab === "Track" && (
          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">Track Application Status</h3>
            <p className="text-xs text-slate-400">Enter your application tracking ID (e.g., KKR-2026-8942) to view live trial dates & approval status.</p>

            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. KKR-2026-8942"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm uppercase font-mono tracking-wider focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
              >
                Search Status
              </button>
            </form>

            {/* Quick Demo Hint */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Try sample code: <code className="text-amber-400 font-mono font-bold">KKR-2026-8942</code></span>
              <button
                type="button"
                onClick={() => setTrackingCode("KKR-2026-8942")}
                className="text-amber-400 hover:underline"
              >
                Auto-fill
              </button>
            </div>

            {searchAttempted && (
              <div className="pt-4 border-t border-slate-800">
                {trackedApp ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-slate-400">{trackedApp.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${trackedApp.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        Status: {trackedApp.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <h4 className="text-lg font-bold text-white">{trackedApp.name}</h4>
                      <p className="text-xs text-slate-300">{trackedApp.rollNumber} • {trackedApp.department} ({trackedApp.year})</p>
                      <p className="text-xs text-amber-400">Sports: {trackedApp.preferredSports.join(", ")}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300">
                      <span className="font-bold text-white block mb-0.5">Physical Education Desk Remarks:</span>
                      <p>{trackedApp.remarks}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                    <p className="font-bold">No application found matching '{trackingCode}'</p>
                    <p className="text-slate-400">Please check your code or apply using the form above.</p>
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
