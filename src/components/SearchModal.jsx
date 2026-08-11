import React, { useState } from 'react';
import { SPORTS_LIST, EVENTS_DATA, GOVERNANCE_TREE, RULES_CONSTITUTION } from '../data/mockData';
import { Search, X, Trophy, Calendar, User, BookOpen, ArrowRight } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingSports = q ? SPORTS_LIST.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) : [];
  const matchingEvents = q ? EVENTS_DATA.filter(e => e.title.toLowerCase().includes(q) || e.sport.toLowerCase().includes(q)) : [];
  const matchingGov = q ? GOVERNANCE_TREE.filter(g => g.title.toLowerCase().includes(q) || g.name.toLowerCase().includes(q)) : [];
  const matchingRules = q ? RULES_CONSTITUTION.filter(r => r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)) : [];

  const hasResults = matchingSports.length > 0 || matchingEvents.length > 0 || matchingGov.length > 0 || matchingRules.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6">
        
        {/* Search Bar Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-amber-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search sports, events, governance, rules constitution..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto space-y-4 text-xs pr-1">
          {!query && (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Type to search across the entire KKR & KSR Sports Club Portal</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {["Cricket", "Annual Sports Meet", "Principal", "Anti-Ragging", "Table Tennis"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 hover:border-amber-500/40"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center py-8 text-slate-400">
              No portal results found matching "{query}"
            </div>
          )}

          {matchingSports.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Sports Disciplines</span>
              {matchingSports.map(s => (
                <div
                  key={s.id}
                  onClick={() => { onSelectResult('sports'); onClose(); }}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/30 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{s.icon}</span>
                    <span className="font-bold text-white text-sm">{s.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>
              ))}
            </div>
          )}

          {matchingEvents.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Events & Matches</span>
              {matchingEvents.map(e => (
                <div
                  key={e.id}
                  onClick={() => { onSelectResult('events'); onClose(); }}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/30 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{e.title}</h4>
                    <p className="text-[11px] text-slate-400">{e.sport} • {e.date}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>
              ))}
            </div>
          )}

          {matchingGov.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Governance Officers</span>
              {matchingGov.map((g, idx) => (
                <div
                  key={idx}
                  onClick={() => { onSelectResult('governance'); onClose(); }}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/30 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{g.title}</h4>
                    <p className="text-[11px] text-amber-400">{g.name}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>
              ))}
            </div>
          )}

          {matchingRules.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Constitution Rules</span>
              {matchingRules.map((r, idx) => (
                <div
                  key={idx}
                  onClick={() => { onSelectResult('rules'); onClose(); }}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/30 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{r.chapter}: {r.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate max-w-md">{r.content}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
