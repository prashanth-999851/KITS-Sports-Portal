import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import EmptyState from '../../components/EmptyState';
import { Bell, Send, Megaphone, Trash2, Loader2 } from 'lucide-react';

export default function NotificationsAdminPage() {
  const { notifications, broadcastNotification, clearNotifications } = useConvexState();
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Announcement');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await broadcastNotification(message, type);
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Notification Broadcaster</h2>
          <p className="text-xs text-[var(--text-muted)]">Push real-time alerts to the public website (Announcement, Emergency, Match Update, Event Reminder).</p>
        </div>
        {notifications.length > 0 && (
          <button onClick={clearNotifications} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200">
            Clear All Alerts
          </button>
        )}
      </div>

      <form onSubmit={handleBroadcast} className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-500" />
          <span>Create Campus Broadcast Alert</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Broadcast Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
            >
              <option value="Announcement">Announcement</option>
              <option value="Emergency">Emergency</option>
              <option value="Match Update">Match Update</option>
              <option value="Event Reminder">Event Reminder</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Alert Message *</label>
          <textarea
            required rows={3}
            placeholder="Type official notification message to be displayed live on public website..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Broadcasting Live...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Broadcast Notification Live</span>
            </>
          )}
        </button>
      </form>

      {/* Active Broadcasts List */}
      <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Active Campus Alerts ({notifications.length})</h3>

        {notifications.length === 0 ? (
          <EmptyState
            title="No Active Notifications"
            description="Use the form above to broadcast official notifications to the public website."
            icon={Bell}
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                    n.type === 'Emergency' ? 'bg-red-500 text-white' :
                    n.type === 'Match Update' ? 'bg-rose-500 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {n.type}
                  </span>
                  <span className="text-[var(--text-muted)]">{n.time}</span>
                </div>
                <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed pt-1">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
