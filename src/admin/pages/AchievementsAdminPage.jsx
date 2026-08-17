import React, { useState, useEffect } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Award, Medal, Trophy, Plus, X, Trash2, Edit, Loader2 } from 'lucide-react';

export default function AchievementsAdminPage() {
  const { achievements, addAchievement, deleteAchievement, updateSettings, isLoading } = useConvexState();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showTallyModal, setShowTallyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tallyGold = achievements?.tallies?.gold ?? 0;
  const tallySilver = achievements?.tallies?.silver ?? 0;
  const tallyBronze = achievements?.tallies?.bronze ?? 0;
  const tallyTrophies = achievements?.tallies?.trophies ?? 0;

  const [tallyData, setTallyData] = useState({
    gold: tallyGold,
    silver: tallySilver,
    bronze: tallyBronze,
    trophies: tallyTrophies
  });

  useEffect(() => {
    setTallyData({
      gold: tallyGold,
      silver: tallySilver,
      bronze: tallyBronze,
      trophies: tallyTrophies
    });
  }, [tallyGold, tallySilver, tallyBronze, tallyTrophies]);

  const [formData, setFormData] = useState({
    title: '',
    recipient: '',
    category: 'Individual Excellence',
    achievement: '',
    medalType: 'Gold',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600'
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setFormData(prev => ({ ...prev, image: compressed }));
      } catch (err) {
        console.error("Failed to process image:", err);
        showToast("Failed to process image.", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addAchievement(formData);
      showToast('Achievement added successfully!', 'success');
      setShowModal(false);
      setFormData({ title: '', recipient: '', category: 'Individual Excellence', achievement: '', medalType: 'Gold', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600' });
    } catch (err) {
      console.error(err);
      showToast('Failed to add achievement.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTallySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateSettings({
        tally_gold: tallyData.gold,
        tally_silver: tallyData.silver,
        tally_bronze: tallyData.bronze,
        tally_trophies: tallyData.trophies
      });
      showToast('Medal tallies saved and updated successfully!', 'success');
      setShowTallyModal(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to update medal tallies.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTallyModal = () => {
    setTallyData({
      gold: achievements.tallies.gold,
      silver: achievements.tallies.silver,
      bronze: achievements.tallies.bronze,
      trophies: achievements.tallies.trophies
    });
    setShowTallyModal(true);
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Achievements & Wall of Fame Manager</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage institutional medal tallies (Gold, Silver, Bronze, Trophies) and award certificates.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openTallyModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Medal Tallies</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Wall of Fame Award</span>
          </button>
        </div>
      </div>

      {/* Tally Stats */}
      {isLoading || !achievements.tallies?.isLoaded ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-2 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-card-subtle)] mx-auto"></div>
              <div className="h-6 w-12 bg-[var(--bg-card-subtle)] rounded mx-auto"></div>
              <div className="h-3 w-16 bg-[var(--bg-card-subtle)] rounded mx-auto"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-1 relative group">
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
      )}

      {/* Awards Grid */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : achievements.awards.length === 0 ? (
        <EmptyState
          title="No Wall of Fame Honors Added Yet"
          description="Click 'Add Wall of Fame Award' above to publish player achievements and awards."
          icon={Award}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {achievements.awards.map((award, i) => (
          <div key={award.id || i} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 flex flex-col sm:flex-row gap-4 card-hover relative group">
            <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden shrink-0 border border-[var(--border-color)]">
              <img src={award.image} alt={award.title} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600"; }} />
            </div>
            <div className="space-y-1.5 text-xs flex-1 pr-8">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                {award.category}
              </span>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">{award.title}</h4>
              <p className="text-amber-600 dark:text-amber-400 font-semibold">Awarded to: {award.recipient}</p>
              <p className="text-[var(--text-secondary)] leading-relaxed">{award.achievement}</p>
            </div>
            <button
              onClick={() => deleteAchievement(award.id)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              title="Delete Achievement"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      )}

      {/* Edit Medal Tallies Modal */}
      {showTallyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-xl glass-modal space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Edit Overall Medal Tallies</h3>
              <button onClick={() => setShowTallyModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleTallySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Overall Trophies</label>
                <input type="number" min="0" required value={tallyData.trophies} onChange={(e) => setTallyData({ ...tallyData, trophies: Number(e.target.value) })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Gold Medals</label>
                <input type="number" min="0" required value={tallyData.gold} onChange={(e) => setTallyData({ ...tallyData, gold: Number(e.target.value) })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Silver Medals</label>
                <input type="number" min="0" required value={tallyData.silver} onChange={(e) => setTallyData({ ...tallyData, silver: Number(e.target.value) })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Bronze Medals</label>
                <input type="number" min="0" required value={tallyData.bronze} onChange={(e) => setTallyData({ ...tallyData, bronze: Number(e.target.value) })} className={inputClass} />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving Tallies...</span></> : 'Save Tally Counts'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Award Modal */}
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
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Medal Type *</label>
                <select value={formData.medalType} onChange={(e) => setFormData({ ...formData, medalType: e.target.value })} className={inputClass}>
                  <option value="Gold">Gold Medal</option>
                  <option value="Silver">Silver Medal</option>
                  <option value="Bronze">Bronze Medal</option>
                  <option value="Trophy">Trophy</option>
                </select>
              </div>

              {/* Upload Image Section */}
              <div className="space-y-2 border border-[var(--border-color)] p-3 rounded-lg bg-[var(--bg-card-subtle)]">
                <label className="block text-[var(--text-secondary)] font-semibold">Award Image / Photo</label>

                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1">Upload File from Computer:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-500/10 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>


                {formData.image && (
                  <div className="h-28 rounded overflow-hidden border border-[var(--border-color)] mt-2">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600"; }} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Achievement Narrative *</label>
                <textarea required rows={3} value={formData.achievement} onChange={(e) => setFormData({ ...formData, achievement: e.target.value })} className={inputClass} />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Publishing Honor...</span></> : 'Publish Honor to Wall of Fame'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
