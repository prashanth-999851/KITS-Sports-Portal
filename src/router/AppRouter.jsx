import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context
import { ConvexStateProvider } from '../context/ConvexStateContext';
import { ToastProvider } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSkeleton';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

// Main Landing Page (Eagerly Loaded for Immediate First Paint)
import MainPortalView from '../views/MainPortalView';

// Public Subpages (Lazily Loaded On-Demand)
const AboutView = lazy(() => import('../views/AboutView'));
const JntukStarsView = lazy(() => import('../views/JntukStarsView'));
const RegistrationView = lazy(() => import('../views/RegistrationView'));
const RulesRegulations = lazy(() => import('../components/RulesRegulations'));
const ContactSection = lazy(() => import('../components/ContactSection'));

// Admin Architecture & Guards (Eagerly Loaded for Immediate Shell Paint on Reload)
import ProtectedRoute from '../admin/ProtectedRoute';
import AdminLayout from '../admin/AdminLayout';

// Admin Pages (Lazily Loaded)
const AdminLoginPage = lazy(() => import('../admin/pages/AdminLoginPage'));
const DashboardPage = lazy(() => import('../admin/pages/DashboardPage'));
const RegistrationsAdminPage = lazy(() => import('../admin/pages/RegistrationsAdminPage'));
const MembershipsPage = lazy(() => import('../admin/pages/MembershipsPage'));
const SportsAdminPage = lazy(() => import('../admin/pages/SportsAdminPage'));
const AchievementsAdminPage = lazy(() => import('../admin/pages/AchievementsAdminPage'));
const ExecutiveAdminPage = lazy(() => import('../admin/pages/ExecutiveAdminPage'));
const JntukPlayersAdminPage = lazy(() => import('../admin/pages/JntukPlayersAdminPage'));
const GalleryAdminPage = lazy(() => import('../admin/pages/GalleryAdminPage'));
const NotificationsAdminPage = lazy(() => import('../admin/pages/NotificationsAdminPage'));
const UsersAdminPage = lazy(() => import('../admin/pages/UsersAdminPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0b1e38] text-white flex flex-col items-center justify-center space-y-4 animate-fadeIn">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
        <img src="/logo.png" alt="KITS" className="w-10 h-10 object-contain drop-shadow-md" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-white tracking-wide">KiTS Sports Directorate</p>
        <p className="text-xs text-slate-400 animate-pulse">Loading Sports Management Portal...</p>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <ConvexStateProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              
              {/* Public Routes */}
              <Route path="/" element={<MainPortalView />} />
              <Route path="/register" element={<RegistrationView onBack={() => window.location.href = '/'} />} />
              <Route path="/registration" element={<RegistrationView onBack={() => window.location.href = '/'} />} />
              <Route path="/membership" element={<RegistrationView onBack={() => window.location.href = '/'} />} />
              <Route path="/memberships" element={<RegistrationView onBack={() => window.location.href = '/'} />} />
              <Route path="/about" element={<AboutView onBack={() => window.location.href = '/'} />} />
              <Route path="/jntuk-players" element={<JntukStarsView onBack={() => window.location.href = '/'} />} />
              <Route path="/jntuk-stars" element={<JntukStarsView onBack={() => window.location.href = '/'} />} />
              <Route path="/rules" element={<RulesRegulations onBack={() => window.location.href = '/'} />} />
              <Route path="/constitution" element={<RulesRegulations onBack={() => window.location.href = '/'} />} />
              <Route path="/contact" element={<ContactSection onBack={() => window.location.href = '/'} />} />

              {/* Admin Auth Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Console Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="registrations" element={<RegistrationsAdminPage />} />
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
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ConvexStateProvider>
  );
}
