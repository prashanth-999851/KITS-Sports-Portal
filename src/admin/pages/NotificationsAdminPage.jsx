import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import EmptyState from '../../components/EmptyState';
import { Bell, Send, Megaphone, Loader2, Trash2 } from 'lucide-react';

export default function NotificationsAdminPage() {
  const { notifications, broadcastNotification, deleteNotification, clearNotifications } = useConvexState();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await broadcastNotification(message.trim());
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteNotification(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Announcement Broadcaster</h2>
          <p className="text-xs text-[var(--text-muted)]">Push live scrolling announcements directly to the public website banner.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={clearNotifications} 
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Clear All Announcements
          </button>
        )}
      </div>

      {/* Broadcast Creation Form */}
      <form onSubmit={handleBroadcast} className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-500" />
          <span>Publish New Announcement</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Announcement Message *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Enter announcement notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Broadcasting Live...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Broadcast Announcement Live</span>
            </>
          )}
        </button>
      </form>

      {/* Active Broadcasts List */}
      <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Live Announcements on Website ({notifications.length})
          </h3>
          <span className="text-[11px] text-[var(--text-muted)]">Updates in real-time</span>
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            title="No Active Announcements"
            description="Use the form above to broadcast official announcements to the top website banner."
            icon={Bell}
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className="p-4 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-start justify-between gap-4 transition-all"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-[var(--text-primary)] font-semibold leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)] block">
                    Posted: {n.time || 'Just now'}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(n.id)}
                  disabled={deletingId === n.id}
                  title="Delete Announcement"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {deletingId === n.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
