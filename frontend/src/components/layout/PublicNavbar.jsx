import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Sparkles, ArrowRight, Menu, X, Store, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function PublicNavbar() {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isDemoPage = location.pathname === '/demo';

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-2 sm:top-4 z-50 w-full px-2 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="relative flex h-14 sm:h-16 items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 px-3 sm:px-6 backdrop-blur-xl shadow-lg shadow-slate-900/5 ring-1 ring-black/5 transition-all">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 text-white shadow-sm shadow-indigo-500/25 ring-1 ring-black/5 transition-transform group-hover:scale-105">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Forecast<span className="text-indigo-600">Flow</span>
              </span>
              <span className="hidden sm:inline-block rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 tracking-wide">
                AI RETAIL
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/60 shadow-inner">
            <a
              href="/#features"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3 py-1.5 rounded-lg transition-all"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3 py-1.5 rounded-lg transition-all"
            >
              How It Works
            </a>
            <a
              href="/#kirana"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3 py-1.5 rounded-lg transition-all"
            >
              Kirana Store
            </a>
            <Link
              to="/demo"
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg transition-all ${
                isDemoPage
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 bg-white border border-indigo-200/80 shadow-xs hover:bg-indigo-50/60'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Interactive Demo</span>
            </Link>
          </nav>

          {/* Right Action Buttons - Desktop */}
          <div className="hidden sm:flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-indigo-300 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 shadow-xs transition-all cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-4 py-1.5 sm:px-4.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Bar: Quick Action + Menu Toggle */}
          <div className="flex sm:hidden items-center gap-1.5">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/demo"
                  onClick={closeMenu}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Demo</span>
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs"
              >
                Dashboard
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="mt-2 rounded-2xl border border-slate-200/90 bg-white/98 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-2xl sm:hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="space-y-1 pb-3 border-b border-slate-100">
              <Link
                to="/demo"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl bg-indigo-50/80 px-3.5 py-2.5 text-xs font-bold text-indigo-700"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Interactive Kirana Demo</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="/#features"
                onClick={closeMenu}
                className="block rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Features & Modules
              </a>
              <a
                href="/#how-it-works"
                onClick={closeMenu}
                className="block rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                How It Works
              </a>
              <a
                href="/#kirana"
                onClick={closeMenu}
                className="block rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Kirana Store Solution
              </a>
            </div>

            <div className="pt-3 space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Sign In to Existing Account
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
