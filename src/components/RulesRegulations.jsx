import React, { useState } from 'react';
import { RULES_CONSTITUTION } from '../data/mockData';
import { BookOpen, Download, FileText, ShieldAlert, ChevronRight, CheckCircle } from 'lucide-react';

export default function RulesRegulations() {
  const [selectedChapter, setSelectedChapter] = useState(RULES_CONSTITUTION[0]);
  const [showPdfModal, setShowPdfModal] = useState(false);

  return (
    <section id="rules" className="py-20 bg-slate-950 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Club Constitution</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold">
            RULES & <span className="gold-gradient-text">REGULATIONS</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Official constitutional charter governing player selection, code of conduct, anti-ragging mandates, equipment safety, and sports governance.
          </p>

          <button
            onClick={() => setShowPdfModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg"
          >
            <FileText className="w-4 h-4" />
            <span>Open PDF Rulebook Viewer</span>
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 13 Chapters Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Chapter Selector Navigation (4 Columns) */}
          <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">13 Constitutional Chapters</span>
            {RULES_CONSTITUTION.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedChapter(ch)}
                className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-between border ${
                  selectedChapter.chapter === ch.chapter
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/60 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">{ch.chapter}</span>
                  <span className="text-sm font-semibold">{ch.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            ))}
          </div>

          {/* Chapter Content Display (8 Columns) */}
          <div className="lg:col-span-8 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold uppercase">
                  {selectedChapter.chapter}
                </span>
                <h3 className="text-2xl font-extrabold text-white">{selectedChapter.title}</h3>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line space-y-3">
                {selectedChapter.content}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Mandatory compliance required by all sports club members & student athletes.</span>
            </div>
          </div>

        </div>

      </div>

      {/* PDF Viewer Simulator Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl p-8 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-xl font-extrabold text-white">KKR & KSR Sports Rulebook 2026.pdf</h3>
                  <span className="text-xs text-slate-400">Official Document • 3.4 MB</span>
                </div>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white"
              >
                Close Viewer
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="h-96 rounded-2xl bg-slate-950 border border-slate-800 p-6 overflow-y-auto text-xs text-slate-300 font-mono space-y-4">
              <div className="text-center pb-4 border-b border-slate-800 space-y-1">
                <h4 className="text-lg font-bold text-amber-400 font-sans">KKR & KSR INSTITUTE OF TECHNOLOGY & SCIENCES</h4>
                <p className="text-white font-sans font-semibold">DEPARTMENT OF PHYSICAL EDUCATION & SPORTS</p>
                <p className="text-slate-400 font-sans">CONSTITUTION & REGULATION MANUAL 2026</p>
              </div>

              {RULES_CONSTITUTION.map((ch, i) => (
                <div key={i} className="space-y-1">
                  <h5 className="font-bold text-white text-sm">{ch.chapter}: {ch.title}</h5>
                  <p className="text-slate-400 leading-relaxed pl-4">{ch.content}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Verified by Institute Legal Cell & Physical Director</span>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); alert("Rulebook PDF Download Initiated!"); }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF File (3.4 MB)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
