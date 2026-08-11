import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { Award, Medal, Trophy, Plus, X } from 'lucide-react';

export default function AchievementsAdminPage() {
  const { achievements, addAchievement } = useConvexState();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    recipient: '',
    category: 'Individual Excellence',
    achievement: '',
    medalType: 'Gold',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addAchievement(formData);
    setShowModal(false);
    setFormData({ title: '', recipient: '', category: 'Individual Excellence', achievement: '', medalType: 'Gold', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600' });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Achievements & Wall of Fame Manager</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage institutional medal tallies (Gold, Silver, Bronze, Trophies) and award certificates.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Wall of Fame Award</span>
        </button>
      </div>

      {/* Tally Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-1">
          <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{achievements.tallies.trophies}</p>
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Overall Trophies</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-1">
          <Medal className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-2xl font-bold text-amber-500">{achievements.tallies.gold}</p>
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Gold Medals</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-1">
          <Medal className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-2xl font-bold text-slate-400">{achievements.tallies.silver}</p>
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Silver Medals</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-1">
          <Medal className="w-6 h-6 text-amber-700 mx-auto" />
          <p className="text-2xl font-bold text-amber-700">{achievements.tallies.bronze}</p>
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Bronze Medals</span>
        </div>
      </div>

      {/* Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {achievements.awards.map((award, i) => (
          <div key={i} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 flex flex-col sm:flex-row gap-4 card-hover">
            <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden shrink-0 border border-[var(--border-color)]">
              <img src={award.image} alt={award.title} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                {award.category}
              </span>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">{award.title}</h4>
              <p className="text-amber-600 dark:text-amber-400 font-semibold">Awarded to: {award.recipient}</p>
              <p className="text-[var(--text-secondary)] leading-relaxed">{award.achievement}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Add Wall of Fame Honor</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Award Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Recipient Athlete / Team *</label>
                <input type="text" required value={formData.recipient} onChange={(e) => setFormData({ ...formData, recipient: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Achievement Narrative *</label>
                <textarea required rows={3} value={formData.achievement} onChange={(e) => setFormData({ ...formData, achievement: e.target.value })} className={inputClass} />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]">
                Publish Honor to Wall of Fame
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
