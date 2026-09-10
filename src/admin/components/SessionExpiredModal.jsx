import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { ShieldAlert, Lock, Mail, Eye, EyeOff, Loader2, LogIn, LogOut } from 'lucide-react';

export default function SessionExpiredModal() {
  const { isSessionExpired, setIsSessionExpired, currentUser, login, logout } = useConvexState();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isSessionExpired) return null;

  const userEmail = currentUser?.email || '';

  const handleReAuthenticate = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter your admin password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login(userEmail, password);
      setIsSessionExpired(false);
      setPassword('');
      showToast('Session renewed successfully. You may continue.', 'success');
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchAccount = () => {
    setIsSessionExpired(false);
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_25px_70px_rgba(0,0,0,0.5)] p-6 sm:p-7 space-y-5 text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon Badge */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Admin Session Expired
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Your secure administrative session has timed out or expired. Please re-authenticate your credentials to resume sports portal management without losing your place.
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Re-authenticate Form */}
        <form onSubmit={handleReAuthenticate} className="space-y-4">
          {/* User Account Details */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Signed in as
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{currentUser?.name || 'Administrator'}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">{userEmail}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                {currentUser?.role || 'Admin'}
              </span>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Enter your password to unlock..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Re-authenticate & Resume</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSwitchAccount}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign In with Different Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
