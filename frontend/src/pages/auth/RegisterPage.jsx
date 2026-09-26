import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BlurredLandingBackground } from '../../components/auth/BlurredLandingBackground';
import { Layers, Lock, Mail, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export function RegisterPage() {
  const { register, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'admin',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Register account
      await register({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // 2. Automatically log in upon successful registration
      await login({
        email: formData.email,
        password: formData.password,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8 selection:bg-indigo-600 selection:text-white">
      {/* Blurred Landing Page Background Window */}
      <BlurredLandingBackground />

      {/* Floating Light Frosted Glass Modal Card */}
      <div className="relative z-10 w-full max-w-md space-y-6 rounded-3xl border border-white/80 bg-white/95 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-slate-900/15 text-slate-800 ring-1 ring-slate-900/5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-black/5 hover:scale-105 transition-transform"
          >
            <Layers className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 pt-1">
            Create Store Account
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Start intelligent demand forecasting for your retail store
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 text-sm text-rose-800 border border-rose-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5" htmlFor="fullName">
              Full Name or Store Owner
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ramesh Kumar"
                className="block w-full rounded-xl border border-slate-300 bg-slate-50/60 py-3 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5" htmlFor="email">
              Store / Business Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh@kirana.com"
                className="block w-full rounded-xl border border-slate-300 bg-slate-50/60 py-3 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className="block w-full rounded-xl border border-slate-300 bg-slate-50/60 py-3 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3.5 px-4 text-base font-bold text-white shadow-lg shadow-indigo-600/25 focus-visible:outline-none disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] mt-3 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center text-sm text-slate-600 pt-1 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Sign In here
          </Link>
        </div>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
