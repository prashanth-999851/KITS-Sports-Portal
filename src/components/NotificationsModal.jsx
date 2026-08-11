import React from 'react';
import { Bell, X, Megaphone } from 'lucide-react';

export default function NotificationsModal({ isOpen, onClose, notifications, onClearNotifications }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-4 sm:pr-8 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md glass-modal rounded-xl p-5 space-y-4">
        
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <h3 className="font-bold text-[var(--text-primary)] text-sm">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2.5 text-xs pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-5 text-[var(--text-muted)]">
              No new notifications.
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
                    <Megaphone className="w-3 h-3" /> Broadcast
                  </span>
                  <span className="text-[var(--text-muted)]">{notif.time || 'Just now'}</span>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">{notif.text}</p>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearNotifications}
            className="w-full py-2 rounded-lg text-xs font-medium bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-colors"
          >
            Clear All
          </button>
        )}

      </div>
    </div>
  );
}
