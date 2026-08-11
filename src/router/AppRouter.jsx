import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { ConvexStateProvider } from '../context/ConvexStateContext';

// Public Components
import MainPortalView from '../views/MainPortalView';
import RulesRegulations from '../components/RulesRegulations';
import ContactSection from '../components/ContactSection';

// Admin Architecture & Guards
import ProtectedRoute from '../admin/ProtectedRoute';
import AdminLayout from '../admin/AdminLayout';

// Admin Pages
import AdminLoginPage from '../admin/pages/AdminLoginPage';
import DashboardPage from '../admin/pages/DashboardPage';
import StudentsPage from '../admin/pages/StudentsPage';
import MembershipsPage from '../admin/pages/MembershipsPage';
import SportsAdminPage from '../admin/pages/SportsAdminPage';
import EventsAdminPage from '../admin/pages/EventsAdminPage';
import LiveScoresAdminPage from '../admin/pages/LiveScoresAdminPage';
import AchievementsAdminPage from '../admin/pages/AchievementsAdminPage';
import ExecutiveAdminPage from '../admin/pages/ExecutiveAdminPage';
import DocumentsAdminPage from '../admin/pages/DocumentsAdminPage';
import GalleryAdminPage from '../admin/pages/GalleryAdminPage';
import NotificationsAdminPage from '../admin/pages/NotificationsAdminPage';
import UsersAdminPage from '../admin/pages/UsersAdminPage';
import ReportsAdminPage from '../admin/pages/ReportsAdminPage';
import SettingsAdminPage from '../admin/pages/SettingsAdminPage';

export default function AppRouter({ darkMode, setDarkMode }) {
  return (
    <ConvexStateProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Public Routes */}
          <Route path="/" element={<MainPortalView darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/rules" element={<RulesRegulations onBack={() => window.location.href = '/'} />} />
          <Route path="/contact" element={<ContactSection onBack={() => window.location.href = '/'} />} />

          {/* Admin Auth Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/forgot-password" element={<AdminLoginPage />} />
          <Route path="/admin/reset-password" element={<AdminLoginPage />} />

          {/* Protected Admin Console Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="memberships" element={<MembershipsPage />} />
            <Route path="sports" element={<SportsAdminPage />} />
            <Route path="events" element={<EventsAdminPage />} />
            <Route path="live-scores" element={<LiveScoresAdminPage />} />
            <Route path="achievements" element={<AchievementsAdminPage />} />
            <Route path="executive-body" element={<ExecutiveAdminPage />} />
            <Route path="documents" element={<DocumentsAdminPage />} />
            <Route path="gallery" element={<GalleryAdminPage />} />
            <Route path="notifications" element={<NotificationsAdminPage />} />
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <UsersAdminPage />
              </ProtectedRoute>
            } />
            <Route path="reports" element={<ReportsAdminPage />} />
            <Route path="settings" element={<SettingsAdminPage />} />
          </Route>

          {/* Fallback redirect unauthenticated users accessing unknown /admin routes to /admin/login */}
          <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </ConvexStateProvider>
  );
}
