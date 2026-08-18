import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { UserPlus, X } from 'lucide-react';

export default function UsersAdminPage() {
  const { users, addUser, toggleUserActive } = useConvexState();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sports Coordinator'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser(formData);
    setShowModal(false);
    setFormData({ name: '', email: '', password: '', role: 'Sports Coordinator' });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Admin & RBAC Role Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage admin staff accounts and assign Role-Based Access Control (RBAC) permissions.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0d3a73] text-white hover:bg-[#104a8e]"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Admin User</span>
        </button>
      </div>

      <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] uppercase font-bold border-b border-[var(--border-color)]">
              <tr>
                <th className="p-3">Admin ID</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-card-subtle)]">
                  <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{u.id}</td>
                  <td className="p-3 font-bold text-[var(--text-primary)]">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 font-semibold text-amber-600 dark:text-amber-400">{u.role}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleUserActive(u.id)}
                      className={`px-3 py-1 rounded text-[10px] font-bold ${u.isActive ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}`}
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Create Admin Staff Account</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Admin Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Institutional Email *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Temporary Password *</label>
                <input type="password" required minLength={8} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass} />
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">Use at least 8 characters. Share it securely and ask the admin to change it after first login.</p>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Assign Role *</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputClass}>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Faculty Coordinator">Faculty Coordinator</option>
                  <option value="Sports Coordinator">Sports Coordinator</option>
                  <option value="Event Manager">Event Manager</option>
                  <option value="Content Manager">Content Manager</option>
                  <option value="Sports Captain">Sports Captain</option>
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg font-bold bg-[#0d3a73] text-white hover:bg-[#104a8e]">
                Create Admin & Assign Role
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
