import React, { useState, useEffect } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { useToast } from '../context/ToastContext';
import { ButtonSpinner } from '../components/LoadingSkeleton';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send, 
  Search, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const DEFAULT_SPORTS = [
  "Cricket", "Volleyball", "Basketball", "Badminton",
  "Football", "Kabaddi", "Table Tennis", "Chess",
  "Athletics", "Throwball", "Kho-Kho"
];

export default function RegistrationView({ onBack }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { sports: rawSports = [], applications = [], students = [], addStudentApplication } = useConvexState();

  const [activeTab, setActiveTab] = useState("Apply");
  const [trackingCode, setTrackingCode] = useState("");
  const [trackedApp, setTrackedApp] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [submittedCode, setSubmittedCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preselectedSport = searchParams.get('sport') || "";

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
    selectedSport: preselectedSport || ""
  });

  useEffect(() => {
    if (preselectedSport) {
      setFormData(prev => ({ ...prev, selectedSport: preselectedSport }));
    }
  }, [preselectedSport]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const handleSportSelect = (sportName) => {
    setFormData(prev => ({ ...prev, selectedSport: sportName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedSport) {
      showToast("Please select your preferred sport discipline.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const trackingId = await addStudentApplication({
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
      const finalCode = trackingId || `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedCode(finalCode);
      showToast(`Registration submitted successfully for ${formData.selectedSport}!`, 'success');
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
      showToast('Registration failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      (s.studentId && s.studentId.toLowerCase().trim() === code)
    );

    if (foundStudent) {
      setTrackedApp({
        id: foundStudent.studentId || foundStudent.rollNumber,
        name: foundStudent.name,
        rollNumber: foundStudent.rollNumber,
        department: foundStudent.department,
        preferredSports: [foundStudent.sport || 'Campus Sports'],
        status: foundStudent.status || 'Active Member',
        remarks: 'Official Registered Sports Directorate Member'
      });
      return;
    }

    setTrackedApp(null);
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:border-[#0b2e5b] focus:bg-white focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/logo.png" alt="KITS Logo" className="h-8 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-[#0b2e5b] leading-tight truncate">
                  Student Sports Registration Portal
                </h1>
                <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                  Official Athletic Directorate • KKR & KSR Institute of Technology and Sciences
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="hidden md:inline">Official 2026 Sports Enrollment</span>
          </div>

        </div>
      </header>

      {/* Main Registration Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#0b2e5b]/10 text-[#0b2e5b] tracking-wider uppercase">
            Official Enrollment
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b2e5b] tracking-tight">
            Sports Registration & Status Tracker
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Submit your official player application for inter-collegiate tournaments, university selections, and team practice trials.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="p-1 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-1 max-w-md w-full">
            <button
              onClick={() => setActiveTab("Apply")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "Apply"
                  ? 'bg-[#0b2e5b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0b2e5b] hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Apply for Membership</span>
            </button>

            <button
              onClick={() => setActiveTab("Track")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "Track"
                  ? 'bg-[#0b2e5b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0b2e5b] hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Application</span>
            </button>
          </div>
        </div>

        {/* TAB 1: APPLY FORM */}
        {activeTab === "Apply" && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            {submittedCode ? (
              <div className="p-6 text-center space-y-4 max-w-md mx-auto animate-fadeIn">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-bold text-slate-800">Application Submitted!</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Your sports registration has been recorded successfully. Please save your application tracking code:
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[#0b2e5b] text-xl font-extrabold tracking-wide">
                  {submittedCode}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setSubmittedCode(null)}
                    className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Submit Another Application
                  </button>
                  <button
                    onClick={() => {
                      setTrackingCode(submittedCode);
                      setActiveTab("Track");
                      setSubmittedCode(null);
                    }}
                    className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-colors cursor-pointer shadow-sm"
                  >
                    Track Status Now
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Sport Selection */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    1. Select Sport Discipline *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSports.map((sport) => {
                      const isSelected = formData.selectedSport === sport;
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => handleSportSelect(sport)}
                          className={`p-2.5 rounded-lg text-xs font-semibold text-center transition-all duration-200 border cursor-pointer ${
                            isSelected
                              ? 'bg-[#0b2e5b] text-white border-[#0b2e5b] shadow-sm scale-102'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {sport}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Personal & Academic Info */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Student Information
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Student Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">College Roll Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter roll number"
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Year of Study *</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className={inputClass}
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Department *</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className={inputClass}
                      >
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="CSM">CSM</option>
                        <option value="CSD">CSD</option>
                        <option value="CAI">CAI</option>
                        <option value="AIDS">AIDS</option>
                        <option value="MECH">MECH</option>
                        <option value="CIVIL">CIVIL</option>
                        <option value="MBA">MBA</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Section</label>
                      <select
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className={inputClass}
                      >
                        {['1', '2', '3', '4', '5', '6', '7', '8'].map(s => (
                          <option key={s} value={`Section ${s}`}>Section {s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Gender *</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className={inputClass}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Contact Phone *</label>
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
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.selectedSport}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[#0b2e5b] hover:bg-[#0d3a73] disabled:opacity-50 text-white transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {isSubmitting ? (
                    <ButtonSpinner text="Processing Registration..." />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Membership Registration</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        )}

        {/* TAB 2: TRACK STATUS */}
        {activeTab === "Track" && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <form onSubmit={handleTrackSearch} className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enter Tracking ID or Roll Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter tracking ID or roll number"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-[#0b2e5b] focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg font-bold text-xs bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Check</span>
                </button>
              </div>
            </form>

            {searchAttempted && !trackedApp && (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2 animate-fadeIn">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Record Found</h4>
                <p className="text-xs text-slate-500">
                  We couldn't find an application matching "{trackingCode}". Please verify your Tracking ID or College Roll Number.
                </p>
              </div>
            )}

            {trackedApp && (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-800">{trackedApp.name}</h4>
                    <span className="text-xs text-slate-500 font-mono">ID: {trackedApp.id || trackedApp.rollNumber}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                    trackedApp.status === 'Approved' || trackedApp.status === 'Active Member'
                      ? 'bg-emerald-100 text-emerald-700'
                      : trackedApp.status === 'Rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {trackedApp.status || 'Under Review'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Roll Number</span>
                    <span className="font-semibold text-slate-700">{trackedApp.rollNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Department</span>
                    <span className="font-semibold text-slate-700">{trackedApp.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Applied Sport</span>
                    <span className="font-semibold text-[#0b2e5b]">
                      {Array.isArray(trackedApp.preferredSports) ? trackedApp.preferredSports.join(', ') : trackedApp.preferredSports}
                    </span>
                  </div>
                </div>

                {trackedApp.remarks && (
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                    <span className="font-semibold text-slate-700 block">Directorate Remarks:</span>
                    <p>{trackedApp.remarks}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
