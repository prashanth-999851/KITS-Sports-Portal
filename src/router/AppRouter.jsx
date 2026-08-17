import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { ConvexStateProvider } from '../context/ConvexStateContext';

// Public Components
import MainPortalView from '../views/MainPortalView';
import AboutView from '../views/AboutView';
import JntukStarsView from '../views/JntukStarsView';
import RulesRegulations from '../components/RulesRegulations';
import ContactSection from '../components/ContactSection';

// Admin Architecture & Guards
import ProtectedRoute from '../admin/ProtectedRoute';
import AdminLayout from '../admin/AdminLayout';

// Admin Pages
import AdminLoginPage from '../admin/pages/AdminLoginPage';
import DashboardPage from '../admin/pages/DashboardPage';
import MembershipsPage from '../admin/pages/MembershipsPage';
import SportsAdminPage from '../admin/pages/SportsAdminPage';
import AchievementsAdminPage from '../admin/pages/AchievementsAdminPage';
import ExecutiveAdminPage from '../admin/pages/ExecutiveAdminPage';
import JntukPlayersAdminPage from '../admin/pages/JntukPlayersAdminPage';
import GalleryAdminPage from '../admin/pages/GalleryAdminPage';
import NotificationsAdminPage from '../admin/pages/NotificationsAdminPage';
import UsersAdminPage from '../admin/pages/UsersAdminPage';
import { ToastProvider } from '../context/ToastContext';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRouter({ darkMode, setDarkMode }) {
  return (
    <ConvexStateProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            
            {/* Public Routes */}
            <Route path="/" element={<MainPortalView darkMode={darkMode} setDarkMode={setDarkMode} />} />
            <Route path="/about" element={<AboutView onBack={() => window.location.href = '/'} />} />
            <Route path="/jntuk-stars" element={<JntukStarsView onBack={() => window.location.href = '/'} />} />
            <Route path="/rules" element={<RulesRegulations onBack={() => window.location.href = '/'} />} />
            <Route path="/contact" element={<ContactSection onBack={() => window.location.href = '/'} />} />

            {/* Admin Auth Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

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
              <Route path="memberships" element={<MembershipsPage />} />
              <Route path="sports" element={<SportsAdminPage />} />
              <Route path="achievements" element={<AchievementsAdminPage />} />
              <Route path="jntuk-players" element={<JntukPlayersAdminPage />} />
              <Route path="executive-body" element={<ExecutiveAdminPage />} />
              <Route path="gallery" element={<GalleryAdminPage />} />
              <Route path="notifications" element={<NotificationsAdminPage />} />
              <Route path="users" element={
                <ProtectedRoute allowedRoles={['Super Admin']}>
                  <UsersAdminPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Fallback 404 Route */}
            <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ConvexStateProvider>
  );
}
