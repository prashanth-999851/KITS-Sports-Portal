import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { Activity, Plus, Play, Pause, CheckCircle2, Save, X, Trash2 } from 'lucide-react';

export default function LiveScoresAdminPage() {
  const { fixtures, updateFixtureScore, addFixture, deleteFixture, deleteAllFixtures, isLoading } = useConvexState();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    tournament: 'State Inter-College Premier League (Semi Final)',
    team1: 'KKR & KSR Strikers',
    team2: 'VR Siddhartha Kings',
    score1: '184/5 (20.0 overs)',
    score2: '152/9 (18.4 overs)',
    result: 'KKR & KSR won by 32 runs',
    date: 'Today, 02:30 PM',
    venue: 'KKR & KSR Turf Oval Ground'
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addFixture(formData);
    setShowModal(false);
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none font-mono";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Real-Time Live Score Controller</h2>
          <p className="text-xs text-[var(--text-muted)]">Control match states (LIVE, PAUSED, FINAL), update live scores, overs, and match results. Public website updates instantly.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {fixtures.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all live matches?")) {
                  deleteAllFixtures();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Matches</span>
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Live Match</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : fixtures.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
          <Activity className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">No Active Matches</h3>
          <p className="text-xs text-[var(--text-muted)]">There are currently no live fixtures broadcasted. Click "Create Live Match" to publish one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fixtures.map((fix) => (
            <div key={fix.id} className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-sm relative">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{fix.tournament}</span>
                  <p className="text-[11px] text-[var(--text-muted)]">📍 {fix.date}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                    fix.status === 'LIVE' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 animate-pulse' :
                    fix.status === 'PAUSED' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' :
                    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  }`}>
                    Status: {fix.status}
                  </span>

                  <button
                    onClick={() => updateFixtureScore(fix.id, fix.score1, fix.score2, 'LIVE')}
                    className="p-1.5 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-500 flex items-center gap-1"
                    title="Set LIVE"
                  >
                    <Play className="w-3 h-3" /> Live
                  </button>

                  <button
                    onClick={() => updateFixtureScore(fix.id, fix.score1, fix.score2, 'PAUSED')}
                    className="p-1.5 rounded bg-amber-600 text-white text-[10px] font-bold hover:bg-amber-500 flex items-center gap-1"
                    title="Pause Match"
                  >
                    <Pause className="w-3 h-3" /> Pause
                  </button>

                  <button
                    onClick={() => updateFixtureScore(fix.id, fix.score1, fix.score2, 'FINAL')}
                    className="p-1.5 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-500 flex items-center gap-1"
                    title="Mark Final"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Final
                  </button>

                  <button
                    onClick={() => deleteFixture(fix.id)}
                    className="p-1.5 rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100"
                    title="Delete Match"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Score Modifier Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">{fix.team1} Score</label>
                  <input
                    type="text"
                    defaultValue={fix.score1}
                    onBlur={(e) => updateFixtureScore(fix.id, e.target.value, fix.score2)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">{fix.team2} Score</label>
                  <input
                    type="text"
                    defaultValue={fix.score2}
                    onBlur={(e) => updateFixtureScore(fix.id, fix.score1, e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">Match Result Remarks</label>
                <input
                  type="text"
                  defaultValue={fix.result}
                  onBlur={(e) => updateFixtureScore(fix.id, fix.score1, fix.score2, undefined, undefined, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] font-medium"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Create Live Match Scoreboard</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Tournament / Title *</label>
                <input type="text" required value={formData.tournament} onChange={(e) => setFormData({ ...formData, tournament: e.target.value })} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Team 1 *</label>
                  <input type="text" required value={formData.team1} onChange={(e) => setFormData({ ...formData, team1: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Team 2 *</label>
                  <input type="text" required value={formData.team2} onChange={(e) => setFormData({ ...formData, team2: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Team 1 Score *</label>
                  <input type="text" required value={formData.score1} onChange={(e) => setFormData({ ...formData, score1: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Team 2 Score *</label>
                  <input type="text" required value={formData.score2} onChange={(e) => setFormData({ ...formData, score2: e.target.value })} className={inputClass} />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]">
                Start Live Match Broadcasting
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
