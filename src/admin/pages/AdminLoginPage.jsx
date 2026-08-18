import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { ButtonSpinner } from '../../components/LoadingSkeleton';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, AlertCircle, Clock } from 'lucide-react';

export default function AdminLoginPage() {
  const { currentUser, login } = useConvexState();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: false, password: false });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Rate Limiting / Lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (currentUser?.sessionToken) {
      navigate(from, { replace: true });
    }
  }, [currentUser?.sessionToken, from, navigate]);

  // Handle Lockout Timer Countdown
  useEffect(() => {
    let timer;
    if (lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTimer === 0 && failedAttempts >= 5) {
      setFailedAttempts(0); // Reset attempts after lockout period finishes
      setError('');
    }
    return () => clearInterval(timer);
  }, [lockoutTimer, failedAttempts]);

  const validateForm = (cleanEmail, cleanPassword) => {
    const errors = { email: false, password: false };
    let errorMsg = '';

    if (!cleanEmail && !cleanPassword) {
      errors.email = true;
      errors.password = true;
      errorMsg = 'Please enter both your institutional email and password.';
    } else if (!cleanEmail) {
      errors.email = true;
      errorMsg = 'Institutional email is required.';
    } else if (!cleanPassword) {
      errors.password = true;
      errorMsg = 'Password is required.';
    } else {
      // Email format regex check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        errors.email = true;
        errorMsg = 'Please enter a valid institutional email address.';
      } else if (cleanPassword.length < 6) {
        errors.password = true;
        errorMsg = 'Password must be at least 6 characters long.';
      }
    }

    setFieldErrors(errors);
    return errorMsg;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ email: false, password: false });

    // Check if account is locked out
    if (lockoutTimer > 0) {
      setError(`Too many failed attempts. Login is locked for ${lockoutTimer} seconds.`);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    // Client-side validation check
    const validationError = validateForm(cleanEmail, cleanPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoggingIn(true);

    try {
      const adminUser = await login(cleanEmail, cleanPassword);
      if (!adminUser?.sessionToken) {
        throw new Error('Admin session was not created.');
      }
      showToast('Authenticated as Admin Officer!', 'success');
      setFailedAttempts(0);
    } catch (err) {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      const rawMessage = err?.message || String(err || '');
      let message = rawMessage || 'Invalid institutional email or password. Please verify your credentials.';
      const rawError = rawMessage.toLowerCase();

      if (rawError.includes('invalid email address or password')) {
        message = 'Invalid institutional email or password. Please verify your credentials.';
      } else if (rawError.includes('suspended')) {
        message = 'Your Admin account is currently suspended. Please contact the Directorate.';
      } else if (rawError.includes('failed to fetch') || rawError.includes('networkerror') || rawError.includes('network')) {
        message = 'Unable to connect to Directorate servers. Please check your internet connection.';
      }

      if (attempts >= 5) {
        setLockoutTimer(60); // 60 seconds lockout
        message = 'Maximum failed login attempts reached. Console access locked for 60 seconds.';
      } else if (attempts >= 3) {
        message += ` Warning: ${5 - attempts} login attempts remaining before temporary lockout.`;
      }

      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b2e5b] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo Banner */}
        <div className="text-center space-y-2">
          <img 
            src="/logo.png" 
            alt="KKR & KSR Logo" 
            className="h-16 w-auto object-contain mx-auto" 
          />
          <h1 className="text-xl font-extrabold tracking-tight">KKR & KSR Sports Directorate</h1>
          <p className="text-xs text-amber-400 font-semibold">Admin & Sports Officers Console</p>
        </div>

        {/* Login Card */}
        <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Sign In to Admin Portal</span>
            </h2>

            {/* Error Banner */}
            {error && (
              <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                lockoutTimer > 0 
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300' 
                  : 'bg-red-500/15 border border-red-500/30 text-red-300'
              }`}>
                {lockoutTimer > 0 ? (
                  <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                )}
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Institutional Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-3 w-4 h-4 transition-colors ${
                  fieldErrors.email ? 'text-red-400' : 'text-slate-500'
                }`} />
                <input
                  type="email"
                  disabled={lockoutTimer > 0 || isLoggingIn}
                  placeholder="Enter your institutional email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: false });
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 text-white text-xs transition-colors focus:outline-none disabled:opacity-50 ${
                    fieldErrors.email 
                      ? 'border-2 border-red-500/80 focus:border-red-500' 
                      : 'border border-slate-800 focus:border-amber-400'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-3 w-4 h-4 transition-colors ${
                  fieldErrors.password ? 'text-red-400' : 'text-slate-500'
                }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={lockoutTimer > 0 || isLoggingIn}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: false });
                  }}
                  className={`w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-950 text-white text-xs transition-colors focus:outline-none disabled:opacity-50 ${
                    fieldErrors.password 
                      ? 'border-2 border-red-500/80 focus:border-red-500' 
                      : 'border border-slate-800 focus:border-amber-400'
                  }`}
                />
                <button
                  type="button"
                  disabled={lockoutTimer > 0 || isLoggingIn}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={lockoutTimer > 0 || isLoggingIn}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                />
                <span>Remember session on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn || lockoutTimer > 0}
              className="w-full py-3 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-md flex items-center justify-center mt-2"
            >
              {isLoggingIn ? (
                <ButtonSpinner text="Authenticating..." />
              ) : lockoutTimer > 0 ? (
                <span>Locked ({lockoutTimer}s)</span>
              ) : (
                <span>Authenticate & Access Console</span>
              )}
            </button>
          </form>

        </div>

        <div className="text-center text-xs text-slate-500">
          <p>© 2026 KKR & KSR Institute of Technology & Sciences</p>
        </div>

      </div>
    </div>
  );
}
