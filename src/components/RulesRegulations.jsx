import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { 
  Download, 
  FileText, 
  ChevronRight, 
  CheckCircle, 
  Search, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink,
  Scale,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SPORTS_CONSTITUTION, SPORTS_CATEGORIES } from '../constants/sportsConstitution';

// Rich formatter for chapter text blocks
function ChapterBodyRenderer({ content }) {
  // Parse content into law blocks or major sections
  const sections = useMemo(() => {
    const lines = content.split('\n');
    const parsed = [];
    let current = { header: null, lines: [] };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const isLawHeader = /^LAW\s+[\d.]+/i.test(trimmed);
      const isMajorHeader = /^(Vision|Mission|Core Values):-/i.test(trimmed);

      if (isLawHeader || isMajorHeader) {
        if (current.header !== null || current.lines.length > 0) {
          parsed.push(current);
        }
        current = { header: trimmed, lines: [] };
      } else {
        current.lines.push(line);
      }
    }

    if (current.header !== null || current.lines.length > 0) {
      parsed.push(current);
    }

    return parsed;
  }, [content]);

  // Helper to render individual lines within a law
  const renderLines = (lines) => {
    // Check if lines form an organizational hierarchy (contains '↓')
    const hasArrows = lines.some(l => l.trim() === '↓');
    if (hasArrows) {
      const flowItems = lines
        .map(l => l.trim())
        .filter(l => l.length > 0 && l !== '↓');

      return (
        <div className="py-2 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Governance & Reporting Flow:
          </div>
          <div className="flex flex-col items-center sm:items-start space-y-1.5 pl-1 sm:pl-3">
            {flowItems.map((item, idx) => (
              <React.Fragment key={idx}>
                <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#0b2e5b] font-semibold text-xs shadow-xs text-center sm:text-left">
                  {item}
                </div>
                {idx < flowItems.length - 1 && (
                  <div className="text-blue-400 font-bold text-xs pl-4">↓</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        {lines.map((l, idx) => {
          const trimmed = l.trim();
          if (!trimmed) return null;

          // Legal basis or important alerts
          if (trimmed.startsWith('Legal Basis:') || trimmed.startsWith('Hierarchy Order:') || trimmed.includes('< Institute Rules <')) {
            return (
              <div key={idx} className="my-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
                <Scale className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{trimmed}</span>
              </div>
            );
          }

          // Authorized responses or procedure headings
          if (trimmed.startsWith('Authorized Response') || trimmed.startsWith('Response:')) {
            return (
              <div key={idx} className="mt-3 pt-2 border-t border-slate-200 text-xs font-bold text-[#0b2e5b] uppercase tracking-wide">
                {trimmed}
              </div>
            );
          }

          // Bullet points
          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            return (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                <span className="leading-relaxed">{trimmed.replace(/^[•-]\s*/, '')}</span>
              </div>
            );
          }

          // Numbered or lettered lists (e.g. "1. ", "a. ")
          const listMatch = trimmed.match(/^([0-9]+|[a-z])\.\s+(.*)$/i);
          if (listMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 pl-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0 mt-0.5">
                  {listMatch[1]}
                </span>
                <span className="leading-relaxed">{listMatch[2]}</span>
              </div>
            );
          }

          // Regular paragraph text
          return (
            <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {sections.map((sec, secIdx) => (
        <div 
          key={secIdx}
          className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
        >
          {sec.header && (
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-[#0b2e5b]" />
              <h4 className="text-xs sm:text-sm font-bold text-[#0b2e5b] tracking-wide">
                {sec.header}
              </h4>
            </div>
          )}
          {renderLines(sec.lines)}
        </div>
      ))}
    </div>
  );
}

export default function RulesRegulations({ onBack }) {
  const navigate = useNavigate();
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfViewMode, setPdfViewMode] = useState("pdf"); // 'pdf' or 'text'
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

  const chapters = SPORTS_CONSTITUTION;

  // Filter chapters by category and search term
  const filteredChapters = useMemo(() => {
    return chapters
      .map((ch, originalIdx) => ({ ...ch, originalIdx }))
      .filter(ch => {
        const matchesCategory = selectedCategory === "All" || ch.category === selectedCategory;
        if (!matchesCategory) return false;

        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        return (
          ch.title.toLowerCase().includes(q) || 
          ch.chapter.toLowerCase().includes(q) ||
          (ch.laws && ch.laws.toLowerCase().includes(q)) ||
          ch.content.toLowerCase().includes(q)
        );
      });
  }, [chapters, selectedCategory, searchQuery]);

  // Ensure current selection is valid
  const currentSelectedChapter = chapters[selectedChapterIndex] || chapters[0];

  const handleCopyText = () => {
    const textToCopy = `${currentSelectedChapter.chapter} — ${currentSelectedChapter.title}\nLaws: ${currentSelectedChapter.laws || ''}\n\n${currentSelectedChapter.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300">
      
      {/* Unified Top Navbar */}
      <Navbar
        activeSection="rules"
        onOpenMembership={() => navigate('/register')}
      />

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-36 lg:pt-40 pb-8 sm:pb-12 space-y-6 sm:space-y-8">
        
        {/* Banner */}
        <div className="p-5 sm:p-7 rounded-2xl bg-[#0b2e5b] text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 backdrop-blur-sm text-amber-300 text-xs font-bold uppercase tracking-wider w-fit">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Official Institutional Charter • 24 Chapters</span>
            </div>
            
            {/* PDF Action Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowPdfModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md cursor-pointer hover:shadow-lg"
              >
                <FileText className="w-4 h-4" />
                <span>Official PDF Viewer</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sports Club Rules, Regulations & Code of Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
              Comprehensive governance constitution of the KKR & KSR Institute of Technology & Sciences (Autonomous) Sports Directorate. Encompassing 24 comprehensive chapters, 100+ binding laws, anti-ragging safeguards, player selection frameworks, facility protocols, and 13 sports-specific rulebooks.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/15 text-[11px] text-slate-300">
            <span className="inline-flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              24 Governing Chapters + Preamble
            </span>
            <span className="text-white/30">•</span>
            <span className="inline-flex items-center gap-1">
              <Scale className="w-3 h-3 text-amber-400" />
              UGC & AP Prohibition of Ragging Act Compliant
            </span>
            <span className="text-white/30">•</span>
            <span>13 Official Sports Federations Covered</span>
          </div>
        </div>

        {/* Mobile Dropdown Chapter Selector */}
        <div className="lg:hidden space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Jump to Chapter ({chapters.length} available):
          </label>
          <select
            value={selectedChapterIndex}
            onChange={(e) => setSelectedChapterIndex(Number(e.target.value))}
            className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b2e5b] shadow-sm cursor-pointer"
          >
            {chapters.map((ch, idx) => (
              <option key={idx} value={idx}>
                {ch.chapter}: {ch.title} ({ch.laws})
              </option>
            ))}
          </select>
        </div>

        {/* 2-Column Documentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Chapters Navigation & Category Filters (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 space-y-3 sticky top-36">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search chapters, laws, or sports (e.g. Cricket, Ragging)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-[10px] text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-100 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {SPORTS_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0b2e5b] text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Chapters ({filteredChapters.length})</span>
              {selectedCategory !== "All" && <span>{selectedCategory}</span>}
            </div>

            {/* Chapters List */}
            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredChapters.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                  No chapters match your search query.
                </div>
              ) : (
                filteredChapters.map((ch) => {
                  const isSelected = selectedChapterIndex === ch.originalIdx;
                  return (
                    <button
                      key={ch.originalIdx}
                      onClick={() => setSelectedChapterIndex(ch.originalIdx)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all duration-150 flex items-center justify-between border cursor-pointer ${
                        isSelected
                          ? 'bg-[#0b2e5b] text-white border-[#0b2e5b] shadow-md ring-2 ring-blue-400/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                            {ch.chapter}
                          </span>
                          {ch.laws && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              isSelected ? 'bg-white/15 text-slate-200' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {ch.laws}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-bold block truncate mt-0.5 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          {ch.title}
                        </span>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'rotate-90 text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chapter Reader Panel */}
          <div className="lg:col-span-8 p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Reader Header */}
              <div className="border-b border-slate-100 pb-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-md bg-[#0b2e5b] text-white text-xs font-bold shrink-0 shadow-xs">
                      {currentSelectedChapter.chapter}
                    </span>
                    {currentSelectedChapter.laws && (
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0b2e5b] text-xs font-mono font-semibold">
                        {currentSelectedChapter.laws}
                      </span>
                    )}
                    {currentSelectedChapter.pageRange && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                        Page {currentSelectedChapter.pageRange}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                      {currentSelectedChapter.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyText}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                      title="Copy full chapter clauses"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copied ? 'Copied!' : 'Copy Clauses'}</span>
                    </button>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentSelectedChapter.title}
                </h2>
              </div>

              {/* Reader Body: Rich formatted laws and clauses */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 max-h-[620px] overflow-y-auto space-y-4">
                <ChapterBodyRenderer content={currentSelectedChapter.content} />
              </div>

            </div>

            {/* Pagination & Next/Prev Controls */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  disabled={selectedChapterIndex === 0}
                  onClick={() => {
                    setSelectedChapterIndex(prev => Math.max(0, prev - 1));
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-slate-50 hover:enabled:border-slate-300 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {selectedChapterIndex > 0 ? chapters[selectedChapterIndex - 1].chapter : 'Start'}
                  </span>
                  <span className="sm:hidden">Prev</span>
                </button>

                <div className="text-center">
                  <span className="text-xs font-bold text-slate-700">
                    Chapter {selectedChapterIndex + 1} of {chapters.length}
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-400">
                    {currentSelectedChapter.title}
                  </span>
                </div>

                <button
                  disabled={selectedChapterIndex === chapters.length - 1}
                  onClick={() => {
                    setSelectedChapterIndex(prev => Math.min(chapters.length - 1, prev + 1));
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-slate-50 hover:enabled:border-slate-300 transition-all cursor-pointer shadow-xs"
                >
                  <span className="hidden sm:inline">
                    {selectedChapterIndex < chapters.length - 1 ? chapters[selectedChapterIndex + 1].chapter : 'End'}
                  </span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Strict compliance is binding on all students, coaches, selectors, and sports coordinators.</span>
                </div>
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="text-amber-800 hover:text-amber-950 font-bold text-xs underline cursor-pointer shrink-0"
                >
                  Open PDF
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Official PDF Viewer Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-5xl h-[90vh] p-4 sm:p-6 rounded-2xl bg-white shadow-2xl flex flex-col justify-between space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-blue-50 text-[#0b2e5b]">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    KiTS Sports Rulebook 2026 (Official Document)
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>29 Pages</span>
                    <span>•</span>
                    <span>24 Chapters + Preamble</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">Directorate Certified</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Switcher: PDF vs Text */}
                <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setPdfViewMode("pdf")}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      pdfViewMode === "pdf" ? "bg-white text-[#0b2e5b] shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    PDF Document
                  </button>
                  <button
                    onClick={() => setPdfViewMode("text")}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      pdfViewMode === "text" ? "bg-white text-[#0b2e5b] shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Compiled Text
                  </button>
                </div>

                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden relative">
              {pdfViewMode === "pdf" ? (
                <div className="w-full h-full flex flex-col">
                  <iframe
                    src="/KiTS-Sports-Rulebook-2026.pdf#toolbar=1"
                    title="Official KiTS Sports Constitution Rulebook"
                    className="w-full h-full border-0 rounded-xl"
                  />
                  {/* Fallback info bar below frame */}
                  <div className="p-2 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>If the PDF preview does not load on your mobile device, use Download or Open in New Tab.</span>
                    <a
                      href="/KiTS-Sports-Rulebook-2026.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0b2e5b] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Externally</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-6 overflow-y-auto text-xs text-slate-700 space-y-6">
                  <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                    <h4 className="text-base font-bold text-[#0b2e5b]">KKR & KSR INSTITUTE OF TECHNOLOGY & SCIENCES</h4>
                    <p className="font-semibold text-slate-800">DIRECTORATE OF PHYSICAL EDUCATION & SPORTS</p>
                    <p className="text-slate-400">COMPLETE CONSTITUTION & REGULATION MANUAL 2026</p>
                  </div>

                  {chapters.map((ch, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-[#0b2e5b] text-sm">
                          {ch.chapter}: {ch.title}
                        </span>
                        {ch.laws && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">
                            {ch.laws}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                        {ch.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
              <span className="text-xs text-slate-500">
                Official document verified by Institute Directorate of Physical Education.
              </span>
              
              <div className="flex items-center gap-2">
                <a
                  href="/KiTS-Sports-Rulebook-2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors inline-flex items-center gap-1.5 border border-slate-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Tab</span>
                </a>

                <a
                  href="/KiTS-Sports-Rulebook-2026.pdf"
                  download="KiTS-Sports-Rulebook-2026.pdf"
                  className="px-5 py-2 rounded-lg font-bold text-xs bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-colors inline-flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official PDF (514 KB)</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Unified Footer */}
      <Footer setActiveSection={() => handleBack()} />
    </div>
  );
}
