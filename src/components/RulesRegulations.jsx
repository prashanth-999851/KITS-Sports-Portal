import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, ChevronRight, CheckCircle, Search, Printer, ShieldCheck, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_CONSTITUTION = [
  {
    chapter: "Chapter I",
    title: "Preamble & Institutional Governance",
    content: `1.1 Title and Authority: This charter constitutes the official Athletic Governance Code of KKR & KSR Institute of Technology & Sciences (Autonomous), established under the Directorate of Physical Education.
1.2 Scope: Applicable to all registered undergraduate (B.Tech) and postgraduate (M.Tech, MBA) students participating in intra-mural, inter-departmental, inter-collegiate, and university-level athletic competitions.
1.3 Primary Objective: To foster disciplined athletic excellence, ethical sportsmanship, physical resilience, and leadership while maintaining high academic standards.`
  },
  {
    chapter: "Chapter II",
    title: "Student Athlete Eligibility & Academic Norms",
    content: `2.1 Active Enrollment: Only bonafide, currently enrolled regular students with valid college ID cards are eligible to represent college teams in official tournaments.
2.2 Academic Minimums: Student athletes must maintain a minimum of 75% overall academic attendance (including approved sports on-duty hours).
2.3 Disciplinary Clearance: Any student undergoing disciplinary probation or with pending behavioral inquiries is temporarily suspended from representing the institution until cleared by the Sports Advisory Board.`
  },
  {
    chapter: "Chapter III",
    title: "Team Selection Trials & Merit Procedure",
    content: `3.1 Open Selection Trials: Formal open trials will be conducted at the start of each academic semester for all 11 sports disciplines. Notifications will be published on the Sports Portal 7 days in advance.
3.2 Selection Panel: All selections are judged by the Head Physical Director, designated Faculty Coordinators, and accredited external sports selectors.
3.3 Merit Criteria: Selections are based purely on physical fitness testing, tactical acumen, skill evaluation, and competitive performance during trials.`
  },
  {
    chapter: "Chapter IV",
    title: "Code of Conduct & Anti-Ragging Policy",
    content: `4.1 Sportsmanship & Fair Play: Athletes must uphold utmost respect towards game officials, opponents, coaches, and spectators. Dissent, foul language, and unsporting aggression will result in immediate disqualification.
4.2 Anti-Ragging Mandate: Strict zero-tolerance compliance with UGC and State Anti-Ragging Regulations. Any hazing or harassment within sports teams will lead to instant expulsion and legal filing.
4.3 Substance Prohibition: Strict prohibition of alcohol, tobacco, narcotics, and performance-enhancing substances across campus sports zones and during travel.`
  },
  {
    chapter: "Chapter V",
    title: "Academic On-Duty (OD) & Attendance Relief",
    content: `5.1 Sanction of OD: Student athletes officially representing the college in authorized tournaments are eligible for academic Attendance On-Duty (OD) sanction.
5.2 Prior Approval: All OD requests must be endorsed by the Physical Director and submitted to the respective Head of Department (HOD) at least 48 hours prior to tournament departure.
5.3 Internal Exam Accommodations: If an official tournament conflicts with mid-term examinations, re-tests or alternate evaluation will be scheduled per institutional exam cell guidelines.`
  },
  {
    chapter: "Chapter VI",
    title: "Facilities, Turf Grounds & Arena Regulations",
    content: `6.1 Operating Hours: College sports grounds and gymnasium operate from 06:00 AM - 08:30 AM (Morning Session) and 03:45 PM - 07:00 PM (Evening Session).
6.2 Footwear & Kit Protocol: Appropriate non-marking shoes for indoor wooden courts, spiked shoes on turf tracks, and proper departmental sports uniforms are mandatory.
6.3 Equipment Responsibility: All sports gear issued from the directorate store must be returned in good condition. Negligent damage or loss is subject to replacement liability.`
  },
  {
    chapter: "Chapter VII",
    title: "Annual Sports Awards & Financial Incentives",
    content: `7.1 Inter-University Medallists: Students winning medals at JNTUK Inter-University or South Zone tournaments are awarded cash rewards, institutional trophies, and semester fee concessions.
7.2 Annual Sports Felicitation: Exemplary performers and championship winning teams are honored during the Annual Sports Day Gala.
7.3 Best Athlete Accolades: 'Male Athlete of the Year' and 'Female Athlete of the Year' trophies are awarded annually based on cumulative performance points.`
  },
  {
    chapter: "Chapter VIII",
    title: "Medical Fitness, Safety & Emergency Protocol",
    content: `8.1 Health Clearance: Athletes must submit an annual physical fitness declaration prior to joining high-intensity competitive sports.
8.2 First Aid & Emergency Desk: A certified sports paramedic and emergency first-aid kit is stationed at all official trials, practice matches, and host tournaments.
8.3 Ambulance & Hospital Tie-up: In the event of severe on-field injury, immediate ambulance transit and specialized care at our affiliated network hospital will be initiated immediately.`
  }
];

export default function RulesRegulations({ onBack }) {
  const navigate = useNavigate();
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const chapters = DEFAULT_CONSTITUTION;
  const selectedChapter = chapters[selectedChapterIndex] || chapters[0];

  // Filter chapters by search
  const filteredChapters = chapters
    .map((ch, originalIdx) => ({ ...ch, originalIdx }))
    .filter(ch => 
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ch.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${selectedChapter.chapter}: ${selectedChapter.title}\n\n${selectedChapter.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300">
      
      {/* Top Navigation & Breadcrumb Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Back Button & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={handleBack}
              aria-label="Back to Portal Home"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all shadow-sm shrink-0 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Portal Home</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

            <div className="flex items-center gap-2 shrink min-w-0">
              <img src="/logo.png" alt="KITS Logo" className="h-8 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-[#0b2e5b] leading-tight truncate">
                  KKR & KSR Sports Rulebook & Constitution
                </h1>
                <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                  Official Athletic Governance Charter 2026
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print</span>
            </button>

            <button
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF Viewer</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0b2e5b] text-white shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/10 backdrop-blur-sm text-amber-300 text-[10px] font-bold uppercase tracking-wider w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Institutional Charter</span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-300 font-mono">Ref: KKR-KSR-PE-2026-REG</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold">Sports Directorate Constitution & Rulebook</h2>
            <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
              This charter governs student athlete eligibility, code of conduct, selection procedures, safety mandates, and anti-ragging compliance across all athletic disciplines at KKR & KSR Institute of Technology and Sciences.
            </p>
          </div>
        </div>

        {/* Mobile Dropdown Chapter Selector */}
        <div className="lg:hidden space-y-2">
          <label className="block text-xs font-semibold text-slate-600">Select Constitution Chapter:</label>
          <select
            value={selectedChapterIndex}
            onChange={(e) => setSelectedChapterIndex(Number(e.target.value))}
            className="w-full p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none shadow-sm"
          >
            {chapters.map((ch, idx) => (
              <option key={idx} value={idx}>
                {ch.chapter}: {ch.title}
              </option>
            ))}
          </select>
        </div>

        {/* 2-Column Documentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Chapters Navigation & Search (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 space-y-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search constitution clauses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:border-[#0b2e5b] focus:outline-none shadow-sm"
              />
            </div>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Chapters ({filteredChapters.length} of {chapters.length})
            </div>

            {/* Chapters List */}
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredChapters.map((ch) => {
                const isSelected = selectedChapterIndex === ch.originalIdx;
                return (
                  <button
                    key={ch.originalIdx}
                    onClick={() => setSelectedChapterIndex(ch.originalIdx)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-[#0b2e5b] text-white border-[#0b2e5b] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] uppercase font-semibold block ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                        {ch.chapter}
                      </span>
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {ch.title}
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chapter Reader Panel */}
          <div className="lg:col-span-8 p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Reader Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2.5 py-1 rounded-md bg-[#0b2e5b] text-white text-xs font-bold shrink-0">
                    {selectedChapter.chapter}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{selectedChapter.title}</h3>
                </div>

                <button
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors self-start sm:self-auto cursor-pointer"
                  title="Copy Chapter text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Clause'}</span>
                </button>
              </div>

              {/* Reader Body */}
              <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal space-y-3 max-h-[550px] overflow-y-auto">
                {selectedChapter.content}
              </div>

            </div>

            {/* Pagination Controls */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  disabled={selectedChapterIndex === 0}
                  onClick={() => setSelectedChapterIndex(prev => Math.max(0, prev - 1))}
                  className="px-3 sm:px-4 py-2 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 disabled:opacity-40 hover:enabled:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="hidden sm:inline">← Previous Chapter</span>
                  <span className="sm:hidden">← Prev</span>
                </button>

                <span className="text-xs text-slate-400 font-medium">
                  {selectedChapterIndex + 1} / {chapters.length}
                </span>

                <button
                  disabled={selectedChapterIndex === chapters.length - 1}
                  onClick={() => setSelectedChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
                  className="px-3 sm:px-4 py-2 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 disabled:opacity-40 hover:enabled:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="hidden sm:inline">Next Chapter →</span>
                  <span className="sm:hidden">Next →</span>
                </button>
              </div>

              <div className="p-2.5 sm:p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Strict compliance is required by all students, team captains, and physical directors.</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* PDF Viewer Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl p-6 sm:p-7 rounded-2xl bg-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#0b2e5b]" />
                <div>
                  <h3 className="text-base font-bold text-slate-800">KKR & KSR Sports Rulebook 2026.pdf</h3>
                  <span className="text-xs text-slate-400 font-mono">Official Document • 3.4 MB</span>
                </div>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
              >
                Close Viewer
              </button>
            </div>

            <div className="h-96 rounded-xl bg-slate-50 border border-slate-200 p-5 overflow-y-auto text-xs text-slate-600 space-y-4">
              <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                <h4 className="text-base font-bold text-[#0b2e5b]">KKR & KSR INSTITUTE OF TECHNOLOGY & SCIENCES</h4>
                <p className="font-semibold text-slate-800">DEPARTMENT OF PHYSICAL EDUCATION & SPORTS</p>
                <p className="text-slate-400">CONSTITUTION & REGULATION MANUAL 2026</p>
              </div>

              {chapters.map((ch, i) => (
                <div key={i} className="space-y-1">
                  <h5 className="font-bold text-slate-800 text-sm">{ch.chapter}: {ch.title}</h5>
                  <p className="text-slate-600 leading-relaxed pl-4 whitespace-pre-line">{ch.content}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3">
              <span className="text-xs text-slate-400">Verified by Institute Legal Board & Physical Director</span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-lg font-bold text-xs bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Back Link */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KKR & KSR Institute of Technology & Sciences — Sports Directorate</p>
          <button
            onClick={handleBack}
            className="text-[#0b2e5b] hover:underline font-bold cursor-pointer"
          >
            ← Return to Main Portal Homepage
          </button>
        </div>
      </footer>
    </div>
  );
}
