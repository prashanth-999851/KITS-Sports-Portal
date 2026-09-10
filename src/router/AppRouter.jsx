import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Context
import { ConvexStateProvider } from '../context/ConvexStateContext';
import { ToastProvider } from '../context/ToastContext';

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

// Wrapper components for views that need onBack — avoids window.location.href full reload
function AboutViewWrapper() {
  const navigate = useNavigate();
  return <AboutView onBack={() => navigate('/')} />;
}

function JntukStarsViewWrapper() {
  const navigate = useNavigate();
  return <JntukStarsView onBack={() => navigate('/')} />;
}

function RegistrationViewWrapper() {
  const navigate = useNavigate();
  return <RegistrationView onBack={() => navigate('/')} />;
}

function RulesRegulationsWrapper() {
  const navigate = useNavigate();
  return <RulesRegulations onBack={() => navigate('/')} />;
}

function ContactSectionWrapper() {
  const navigate = useNavigate();
  return <ContactSection onBack={() => navigate('/')} />;
}

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
              <Route path="/register" element={<RegistrationViewWrapper />} />
              <Route path="/registration" element={<RegistrationViewWrapper />} />
              <Route path="/membership" element={<RegistrationViewWrapper />} />
              <Route path="/memberships" element={<RegistrationViewWrapper />} />
              <Route path="/about" element={<AboutViewWrapper />} />
              <Route path="/jntuk-players" element={<JntukStarsViewWrapper />} />
              <Route path="/jntuk-stars" element={<JntukStarsViewWrapper />} />
              <Route path="/rules" element={<RulesRegulationsWrapper />} />
              <Route path="/constitution" element={<RulesRegulationsWrapper />} />
              <Route path="/contact" element={<ContactSectionWrapper />} />

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
