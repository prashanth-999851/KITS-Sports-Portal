import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useConvexState } from '../context/ConvexStateContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Trophy, 
  Calendar, 
  Activity, 
  Award, 
  Sparkles, 
  FileText, 
  Image, 
  Bell, 
  ShieldCheck, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function AdminLayout({ darkMode, setDarkMode }) {
  const { currentUser, logout } = useConvexState();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/students', label: 'Students', icon: Users },
    { path: '/admin/memberships', label: 'Memberships', icon: UserCheck },
    { path: '/admin/sports', label: 'Sports Panels', icon: Trophy },
    { path: '/admin/events', label: 'Events & Matches', icon: Calendar },
    { path: '/admin/live-scores', label: 'Live Scores', icon: Activity, badge: 'LIVE' },
    { path: '/admin/achievements', label: 'Achievements', icon: Award },
    { path: '/admin/executive-body', label: 'Executive Body', icon: Sparkles },
    { path: '/admin/documents', label: 'Document Center', icon: FileText },
    { path: '/admin/gallery', label: 'Media Gallery', icon: Image },
    { path: '/admin/notifications', label: 'Notifications', icon: Bell },
    { path: '/admin/users', label: 'User & RBAC', icon: ShieldCheck, roles: ['Super Admin'] },
    { path: '/admin/reports', label: 'Reports', icon: FileSpreadsheet },
    { path: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 z-50 h-screen w-64 bg-[#0F172A] text-white flex flex-col justify-between transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 space-y-6 overflow-y-auto">
          
          {/* Header Logo */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <img src="/assets/images/logo.png" alt="KITS Logo" className="w-8 h-8 rounded-lg border border-slate-700" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100"; }} />
              <div>
                <h2 className="text-sm font-bold text-white leading-none">KITS Admin</h2>
                <p className="text-[10px] text-amber-400 font-semibold mt-0.5">Management Portal</p>
              </div>
            </div>

            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Badge */}
          {currentUser && (
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[130px]">{currentUser.name}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          )}

          {/* Nav Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Modules</div>
            {navItems.map((item) => {
              if (item.roles && !item.roles.includes(currentUser?.role) && currentUser?.role !== 'Super Admin') {
                return null;
              }
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors
                    ${isActive 
                      ? 'bg-[#1E3A8A] text-white shadow-sm font-semibold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[var(--bg-card)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-[var(--text-primary)]">Sports Directorate Admin</h1>
              <p className="text-[10px] text-[var(--text-muted)]">KITS Sports Club System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>System Online</span>
            </div>
          </div>
        </header>

        {/* Route Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
