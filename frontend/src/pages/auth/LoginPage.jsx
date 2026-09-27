import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { systemService } from '../../services/systemService';
import { api } from '../../services/api';
import { BlurredLandingBackground } from '../../components/auth/BlurredLandingBackground';
import {
  Layers,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Store,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick reset password state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleQuickDemoLogin = async () => {
    setFormData({
      email: 'siddu@kirana.com',
      password: 'Password123',
    });
    setIsSubmitting(true);
    setError('');
    try {
      try {
        await systemService.seedKiranaDemo();
      } catch (seedErr) {
        console.warn('Seed attempt caught:', seedErr);
      }
      await login({
        email: 'siddu@kirana.com',
        password: 'Password123',
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate with demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsResetting(true);

    try {
      const res = await api.post('/api/v1/auth/reset-password', {
        email: resetEmail.trim(),
        new_password: resetNewPass,
      });
      setSuccessMsg(res.message || 'Password reset successfully! Please sign in with your new password.');
      setFormData({
        email: resetEmail.trim(),
        password: resetNewPass,
      });
      setIsResetOpen(false);
      setResetNewPass('');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-y-auto px-4 py-4 sm:py-6 selection:bg-indigo-600 selection:text-white">
      {/* Blurred Landing Page Background Window */}
      <BlurredLandingBackground />

      {/* Floating Light Frosted Glass Modal Card */}
      <div className="relative z-10 w-full max-w-[420px] my-auto space-y-3.5 rounded-2xl border border-white/80 bg-white/95 p-5 sm:p-6 backdrop-blur-2xl shadow-xl shadow-slate-900/15 text-slate-800 ring-1 ring-slate-900/5">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link
            to="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-black/5 hover:scale-105 transition-transform"
          >
            <Layers className="h-5 w-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 pt-0.5">
            Sign in to ForecastFlow
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            AI Inventory & Demand Forecasting for Retailers
          </p>
        </div>

        {/* Demo Login Quick Card */}
        <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/70 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Siddu Kirana & General Store</span>
            </div>
            <span className="rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 border border-indigo-200">
              Demo Store
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
            Kirana shop serving campus students & residential bachelors.
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  email: 'siddu@kirana.com',
                  password: 'Password123',
                });
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-xs transition-all cursor-pointer"
            >
              <span>Auto-Fill</span>
              <span className="font-normal text-slate-400 text-[11px]">(siddu@kirana.com)</span>
            </button>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <Sparkles className="h-3 w-3" />
              <span>1-Click Demo Login</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Reset Modal / Dialog */}
        {isResetOpen ? (
          <form className="space-y-3 rounded-xl border border-indigo-200 bg-slate-50/80 p-3.5" onSubmit={handlePasswordReset}>
            <div className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">Set / Reset Password</h3>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Email Address</label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="kurmasiddartha@gmail.com"
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 px-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">New Password</label>
              <input
                type="text"
                required
                minLength={6}
                value={resetNewPass}
                onChange={(e) => setResetNewPass(e.target.value)}
                placeholder="Enter your new password"
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 px-2.5 text-xs font-mono"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isResetting}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
              >
                {isResetting ? 'Saving...' : 'Update Password & Auto-Fill'}
              </button>
              <button
                type="button"
                onClick={() => setIsResetOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Login Form */
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="kurmasiddartha@gmail.com"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(formData.email || 'kurmasiddartha@gmail.com');
                    setIsResetOpen(true);
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Forgot / Reset Password?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 px-4 text-sm font-bold text-white shadow-md shadow-indigo-600/25 focus-visible:outline-none disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="text-center text-xs text-slate-500 pt-0.5 font-medium">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Create an account
          </Link>
        </div>

        <div className="text-center pt-1.5 border-t border-slate-100">
          <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

