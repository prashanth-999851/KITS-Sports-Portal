import React from 'react';
import { Bell, X, Check, Flame, Trophy, Megaphone } from 'lucide-react';

export default function NotificationsModal({ isOpen, onClose, notifications, onClearNotifications }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-4 sm:pr-8 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-base">Campus Sports Broadcasts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-3 text-xs pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              No new sports broadcasts or notifications.
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-amber-400 uppercase flex items-center gap-1">
                    <Megaphone className="w-3 h-3" /> Broadcast
                  </span>
                  <span className="text-slate-500">{notif.time || 'Just now'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed text-xs">{notif.text}</p>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearNotifications}
            className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white transition"
          >
            Mark All as Read
          </button>
        )}

      </div>
    </div>
  );
}
