import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { Search, X, ArrowRight } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, onSelectResult }) {
  const { sports: SPORTS_LIST, events: EVENTS_DATA, executiveBody: EXECUTIVE_BODY, rules: RULES_CONSTITUTION } = useConvexState();
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingSports = q ? SPORTS_LIST.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) : [];
  const matchingEvents = q ? EVENTS_DATA.filter(e => e.title.toLowerCase().includes(q) || (e.sport && e.sport.toLowerCase().includes(q))) : [];
  const matchingGov = q ? EXECUTIVE_BODY.filter(g => (g.position && g.position.toLowerCase().includes(q)) || g.name.toLowerCase().includes(q)) : [];
  const matchingRules = q ? RULES_CONSTITUTION.filter(r => r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)) : [];

  const hasResults = matchingSports.length > 0 || matchingEvents.length > 0 || matchingGov.length > 0 || matchingRules.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-modal rounded-xl overflow-hidden space-y-4 p-5">
        
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            autoFocus
            placeholder="Search sports, events, leadership, rules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="absolute right-3 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto space-y-4 text-xs pr-1">
          {!query && (
            <div className="text-center py-6 text-[var(--text-muted)] space-y-2">
              <Search className="w-6 h-6 mx-auto opacity-50" />
              <p>Search across the entire KITS Sports Club Portal</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {["Cricket", "Annual Sports Meet", "President", "Anti-Ragging"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-md bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-blue-600 dark:text-blue-400 hover:border-blue-300 transition-colors text-[11px] font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center py-6 text-[var(--text-muted)]">
              No results found for "{query}"
            </div>
          )}

          {matchingSports.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider text-[10px]">Sports</span>
              {matchingSports.map(s => (
                <div
                  key={s.id}
                  onClick={() => { onSelectResult('sports'); onClose(); }}
                  className="p-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-500/40 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="font-semibold text-[var(--text-primary)] text-sm">{s.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </div>
              ))}
            </div>
          )}

          {matchingEvents.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider text-[10px]">Events</span>
              {matchingEvents.map(e => (
                <div
                  key={e.id}
                  onClick={() => { onSelectResult('events'); onClose(); }}
                  className="p-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-500/40 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)] text-sm">{e.title}</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">{e.sport} • {e.date}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </div>
              ))}
            </div>
          )}

          {matchingGov.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider text-[10px]">Leadership</span>
              {matchingGov.map((g, idx) => (
                <div
                  key={idx}
                  onClick={() => { onSelectResult('executive'); onClose(); }}
                  className="p-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-500/40 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)] text-sm">{g.position || g.title}</h4>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">{g.name}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </div>
              ))}
            </div>
          )}

          {matchingRules.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider text-[10px]">Constitution</span>
              {matchingRules.map((r, idx) => (
                <div
                  key={idx}
                  onClick={() => { onSelectResult('rules'); onClose(); }}
                  className="p-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-500/40 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)] text-sm">{r.chapter}: {r.title}</h4>
                    <p className="text-[11px] text-[var(--text-muted)] truncate max-w-md">{r.content}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
