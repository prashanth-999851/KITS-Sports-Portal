import React from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { UserCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function MembershipsPage() {
  const { applications, updateApplicationStatus } = useConvexState();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Membership Approvals & Tracking</h2>
          <p className="text-xs text-[var(--text-muted)]">Track application review status and issue student sports club credentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-semibold">Approved Members</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{applications.filter(a => a.status === 'Approved').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-semibold">Pending Review</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{applications.filter(a => a.status === 'Pending').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-semibold">Rejected / Suspended</span>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{applications.filter(a => a.status === 'Rejected' || a.status === 'Suspended').length}</p>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Membership Review Queue</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] uppercase font-bold border-b border-[var(--border-color)]">
              <tr>
                <th className="p-3">Tracking ID</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Roll & Department</th>
                <th className="p-3">Sports Preference</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Approval Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-[var(--bg-card-subtle)]">
                  <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{app.id}</td>
                  <td className="p-3 font-bold text-[var(--text-primary)]">{app.name}</td>
                  <td className="p-3">{app.rollNumber} ({app.department})</td>
                  <td className="p-3">{Array.isArray(app.preferredSports) ? app.preferredSports.join(", ") : app.preferredSports}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      app.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                      app.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' :
                      'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    {app.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'Approved', 'Membership approved by Physical Education Desk')}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'Rejected', 'Membership application rejected')}
                          className="px-2.5 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-500"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">Review Complete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
