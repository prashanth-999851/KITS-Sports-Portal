import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { Calendar, Plus, Edit, Trash2, MapPin, Eye, EyeOff, X } from 'lucide-react';

export default function EventsAdminPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useConvexState();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    sport: 'Cricket',
    category: 'Upcoming',
    date: 'March 15 - March 18, 2026',
    venue: 'Main Athletic Stadium & Indoor Complex',
    status: 'Registrations Open',
    description: '',
    registrationLimit: 200,
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'
  });

  const handleEdit = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      sport: evt.sport,
      category: evt.category,
      date: evt.date,
      venue: evt.venue,
      status: evt.status,
      description: evt.description,
      registrationLimit: evt.registrationLimit || 200,
      image: evt.image
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
    } else {
      addEvent(formData);
    }
    setShowModal(false);
    setEditingEvent(null);
  };

  const togglePublish = (evt) => {
    updateEvent(evt.id, { isPublished: !evt.isPublished });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Event & Tournament Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Create annual meets, tournaments, control registration limits, and toggle public publishing.</p>
        </div>
        <button
          onClick={() => { setEditingEvent(null); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {events.map((evt) => (
          <div key={evt.id} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden flex flex-col justify-between card-hover">
            <div>
              <div className="relative h-44">
                <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1E3A8A] text-white">{evt.sport}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${evt.isPublished ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                    {evt.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="text-base font-bold text-[var(--text-primary)]">{evt.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{evt.description}</p>
                <div className="space-y-1 text-xs text-[var(--text-muted)]">
                  <p>📅 {evt.date}</p>
                  <p>📍 {evt.venue}</p>
                  <p>👥 Limit: <strong className="text-[var(--text-primary)]">{evt.registrationLimit || 200} athletes</strong></p>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => togglePublish(evt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border ${
                  evt.isPublished ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {evt.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{evt.isPublished ? 'Unpublish' : 'Publish'}</span>
              </button>
              <button
                onClick={() => handleEdit(evt)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
              >
                Edit Event
              </button>
              <button
                onClick={() => deleteEvent(evt.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
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
              <h3 className="text-base font-bold text-[var(--text-primary)]">{editingEvent ? 'Edit Tournament Event' : 'Create Event'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Event Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Sport *</label>
                  <input type="text" required value={formData.sport} onChange={(e) => setFormData({ ...formData, sport: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Past">Past</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Dates *</label>
                  <input type="text" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Venue *</label>
                  <input type="text" required value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Description *</label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClass} />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]">
                {editingEvent ? 'Save Changes' : 'Create & Publish Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
