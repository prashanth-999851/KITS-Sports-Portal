import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { ArrowLeft, Download, FileText, ChevronRight, CheckCircle, Search, Printer, ShieldCheck, Copy, Check } from 'lucide-react';

export default function RulesRegulations({ onBack }) {
  const { rules: RULES_CONSTITUTION } = useConvexState();
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedChapter = RULES_CONSTITUTION[selectedChapterIndex] || RULES_CONSTITUTION[0];

  // Filter chapters by search
  const filteredChapters = RULES_CONSTITUTION.map((ch, originalIdx) => ({ ...ch, originalIdx }))
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Top Navigation & Breadcrumb Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Back Button & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBack}
              aria-label="Back to Portal Home"
              className="inline-flex items-center justify-center p-2 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors shadow-sm shrink-0 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Portal Home</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-[var(--border-color)] shrink-0" />

            <div className="flex items-center gap-2 shrink min-w-0">
              <img src="/logo.png" alt="KITS Logo" className="h-7 sm:h-8 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-tight truncate">
                  KITS Sports Rulebook
                </h1>
                <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] truncate hidden sm:block">
                  Official Athletic Governance Charter 2026
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print</span>
            </button>

            <button
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-1 p-2 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF Viewer</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Banner */}
        <div className="p-4 sm:p-6 rounded-xl bg-[#0F172A] text-white shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800 text-amber-400 text-[10px] font-bold uppercase tracking-wider w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Institutional Charter</span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">Ref: KITS-PE-2026-REG</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold">KKR & KSR Institute Sports Constitution</h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              This charter governs player eligibility, code of conduct, selection procedures, safety mandates, and anti-ragging compliance across all 11 athletic disciplines at KITS.
            </p>
          </div>
        </div>

        {/* Mobile Dropdown Chapter Selector */}
        <div className="lg:hidden space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-secondary)]">Select Constitution Chapter:</label>
          <select
            value={selectedChapterIndex}
            onChange={(e) => setSelectedChapterIndex(Number(e.target.value))}
            className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none"
          >
            {RULES_CONSTITUTION.map((ch, idx) => (
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
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search constitution clauses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">
              Chapters ({filteredChapters.length} of {RULES_CONSTITUTION.length})
            </div>

            {/* Chapters List */}
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredChapters.map((ch) => {
                const isSelected = selectedChapterIndex === ch.originalIdx;
                return (
                  <button
                    key={ch.originalIdx}
                    onClick={() => setSelectedChapterIndex(ch.originalIdx)}
                    className={`w-full text-left p-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-between border ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/40 shadow-sm'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-card-subtle)]'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">{ch.chapter}</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{ch.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-blue-700 dark:text-blue-400' : 'text-[var(--text-muted)]'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chapter Reader Panel */}
          <div className="lg:col-span-8 p-4 sm:p-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Reader Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2.5 py-1 rounded-md bg-[#1E3A8A] text-white text-xs font-bold shrink-0">
                    {selectedChapter.chapter}
                  </span>
                  <h3 className="text-base sm:text-xl font-bold text-[var(--text-primary)] truncate">{selectedChapter.title}</h3>
                </div>

                <button
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors self-start sm:self-auto"
                  title="Copy Chapter text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Clause'}</span>
                </button>
              </div>

              {/* Reader Body */}
              <div className="p-4 sm:p-6 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal space-y-3 max-h-[550px] overflow-y-auto">
                {selectedChapter.content}
              </div>

            </div>

            {/* Pagination Controls */}
            <div className="pt-3 border-t border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  disabled={selectedChapterIndex === 0}
                  onClick={() => setSelectedChapterIndex(prev => Math.max(0, prev - 1))}
                  className="px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)] disabled:opacity-40 hover:enabled:bg-[var(--bg-card)] transition-colors"
                >
                  <span className="hidden sm:inline">← Previous Chapter</span>
                  <span className="sm:hidden">← Prev</span>
                </button>

                <span className="text-[11px] sm:text-xs text-[var(--text-muted)] font-medium">
                  {selectedChapterIndex + 1} / {RULES_CONSTITUTION.length}
                </span>

                <button
                  disabled={selectedChapterIndex === RULES_CONSTITUTION.length - 1}
                  onClick={() => setSelectedChapterIndex(prev => Math.min(RULES_CONSTITUTION.length - 1, prev + 1))}
                  className="px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)] disabled:opacity-40 hover:enabled:bg-[var(--bg-card)] transition-colors"
                >
                  <span className="hidden sm:inline">Next Chapter →</span>
                  <span className="sm:hidden">Next →</span>
                </button>
              </div>

              <div className="p-2.5 sm:p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Strict compliance is required by all students, captains, and physical education directors.</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* PDF Viewer Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl p-7 rounded-xl glass-modal space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">KKR & KSR Sports Rulebook 2026.pdf</h3>
                  <span className="text-xs text-[var(--text-muted)] font-mono">Official Document • 3.4 MB</span>
                </div>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
              >
                Close Viewer
              </button>
            </div>

            <div className="h-96 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] p-5 overflow-y-auto text-xs text-[var(--text-secondary)] space-y-4">
              <div className="text-center pb-4 border-b border-[var(--border-color)] space-y-1">
                <h4 className="text-base font-bold text-blue-700 dark:text-blue-400">KKR & KSR INSTITUTE OF TECHNOLOGY & SCIENCES</h4>
                <p className="font-semibold text-[var(--text-primary)]">DEPARTMENT OF PHYSICAL EDUCATION & SPORTS</p>
                <p className="text-[var(--text-muted)]">CONSTITUTION & REGULATION MANUAL 2026</p>
              </div>

              {RULES_CONSTITUTION.map((ch, i) => (
                <div key={i} className="space-y-1">
                  <h5 className="font-bold text-[var(--text-primary)] text-sm">{ch.chapter}: {ch.title}</h5>
                  <p className="text-[var(--text-secondary)] leading-relaxed pl-4 whitespace-pre-line">{ch.content}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3">
              <span className="text-xs text-[var(--text-muted)]">Verified by Institute Legal Board & Physical Director</span>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); alert("Rulebook PDF Download Started!"); }}
                className="px-5 py-2 rounded-lg font-semibold text-xs bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF (3.4 MB)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer Back Link */}
      <footer className="mt-16 bg-[var(--bg-card)] border-t border-[var(--border-color)] py-6 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KKR & KSR Institute of Technology & Sciences — Sports Directorate</p>
          <button
            onClick={onBack}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            ← Return to Main Portal Homepage
          </button>
        </div>
      </footer>
    </div>
  );
}
