import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConvexState } from '../../context/ConvexStateContext';
import { ButtonSpinner } from '../../components/LoadingSkeleton';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const { login } = useConvexState();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('admin@kitsports.ac.in');
  const [password, setPassword] = useState('Admin@123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoggingIn(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('Password reset link has been dispatched to your institutional email.');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo Banner */}
        <div className="text-center space-y-2">
          <img src="/assets/images/logo.png" alt="KITS Logo" className="w-14 h-14 rounded-xl border border-slate-700 mx-auto shadow-md" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100"; }} />
          <h1 className="text-xl font-extrabold tracking-tight">KITS Sports Directorate</h1>
          <p className="text-xs text-amber-400 font-semibold">Admin & Sports Officers Console</p>
        </div>

        {/* Login Card */}
        <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Sign In to Admin Portal</span>
              </h2>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Institutional Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email" required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"} required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-lg text-xs font-bold bg-[#1E3A8A] hover:bg-[#1E40AF] disabled:opacity-50 text-white transition-colors shadow-md flex items-center justify-center"
              >
                {isLoggingIn ? (
                  <ButtonSpinner text="Authenticating..." />
                ) : (
                  <span>Authenticate & Access Console</span>
                )}
              </button>

              {/* Demo Credentials Box */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-amber-400">Default Super Admin Credentials:</p>
                <p>Email: <code className="text-white">admin@kitsports.ac.in</code></p>
                <p>Password: <code className="text-white">Admin@123456</code></p>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>Password Recovery</span>
              </h2>

              {success && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email</label>
                <input
                  type="email" required
                  placeholder="admin@kitsports.ac.in"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors"
              >
                Send Password Reset Link
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                ← Back to Login
              </button>
            </form>
          )}

        </div>

        <div className="text-center text-xs text-slate-500">
          <p>© 2026 KKR & KSR Institute of Technology & Sciences</p>
        </div>

      </div>
    </div>
  );
}
