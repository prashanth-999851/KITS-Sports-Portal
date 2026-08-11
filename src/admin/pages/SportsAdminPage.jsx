import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { Trophy, Plus, Edit, Trash2, MapPin, User, X } from 'lucide-react';

export default function SportsAdminPage() {
  const { sports, addSport, updateSport, deleteSport } = useConvexState();
  const [showModal, setShowModal] = useState(false);
  const [editingSport, setEditingSport] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Outdoor',
    description: '',
    coordinator: 'K. Venkata Rao',
    assistantCoordinator: 'M. Surya Prakash Rao',
    menCaptain: '',
    womenCaptain: '',
    venue: 'KKR and KSR Sports Ground',
    schedule: 'Mon - Fri (04:30 PM - 06:30 PM)',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'
  });

  const handleEdit = (sport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      category: sport.category,
      description: sport.description,
      coordinator: sport.coordinator,
      assistantCoordinator: sport.assistantCoordinator || '',
      menCaptain: sport.teamDetails?.menCaptain || '',
      womenCaptain: sport.teamDetails?.womenCaptain || '',
      venue: sport.teamDetails?.venue || 'KKR and KSR Sports Ground',
      schedule: sport.schedule || 'Mon - Fri (04:30 PM - 06:30 PM)',
      image: sport.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      coordinator: formData.coordinator,
      assistantCoordinator: formData.assistantCoordinator,
      teamDetails: {
        menCaptain: formData.menCaptain,
        womenCaptain: formData.womenCaptain,
        venue: formData.venue
      },
      schedule: formData.schedule,
      image: formData.image
    };

    if (editingSport) {
      updateSport(editingSport.id, payload);
    } else {
      addSport(payload);
    }
    setShowModal(false);
    setEditingSport(null);
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Sports Discipline Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage 11 sports panels, assigned coordinators, team captains, venues, and schedules.</p>
        </div>
        <button
          onClick={() => { setEditingSport(null); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Sport</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sports.map((s) => (
          <div key={s.id} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden flex flex-col justify-between card-hover">
            <div>
              <div className="relative h-40">
                <img src={s.image} alt={s.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800"; }} />
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded bg-[#1E3A8A] text-white">
                  {s.category}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="text-base font-bold text-[var(--text-primary)]">{s.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{s.description}</p>
                <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1 text-xs text-[var(--text-secondary)]">
                  <p>Faculty: <strong className="text-[var(--text-primary)]">{s.coordinator}</strong></p>
                  {s.teamDetails?.menCaptain && <p>Men Captain: <strong className="text-[var(--text-primary)]">{s.teamDetails.menCaptain}</strong></p>}
                  {s.teamDetails?.womenCaptain && <p>Women Captain: <strong className="text-[var(--text-primary)]">{s.teamDetails.womenCaptain}</strong></p>}
                  <p className="text-[var(--text-muted)] flex items-center gap-1 pt-1"><MapPin className="w-3 h-3 text-amber-500" /> {s.teamDetails?.venue || 'Campus Ground'}</p>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => handleEdit(s)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100"
              >
                Edit Details
              </button>
              <button
                onClick={() => deleteSport(s.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                title="Delete Sport"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">{editingSport ? 'Edit Sport Panel' : 'Add Sport Discipline'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Sport Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Indoor">Indoor</option>
                    <option value="Track & Field">Track & Field</option>
                    <option value="Mind Sport">Mind Sport</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Faculty Coordinator *</label>
                  <input type="text" required value={formData.coordinator} onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Men Captain</label>
                  <input type="text" value={formData.menCaptain} onChange={(e) => setFormData({ ...formData, menCaptain: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Women Captain</label>
                  <input type="text" value={formData.womenCaptain} onChange={(e) => setFormData({ ...formData, womenCaptain: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Description *</label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClass} />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]">
                {editingSport ? 'Save Changes' : 'Create Sport Panel'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
