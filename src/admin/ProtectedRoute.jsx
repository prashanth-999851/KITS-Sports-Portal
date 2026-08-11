import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useConvexState } from '../context/ConvexStateContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useConvexState();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to /admin/login with state return URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Role check if allowedRoles provided
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(currentUser.role) && currentUser.role !== 'Super Admin') {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-main)]">
          <div className="max-w-md p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-4 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center font-bold text-lg">
              403
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Access Denied</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Your current role (<strong className="text-blue-600 dark:text-blue-400">{currentUser.role}</strong>) does not have authorization to view this module.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
}
