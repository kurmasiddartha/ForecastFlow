import React from 'react';
import { Layers, LogIn, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Header({ onToggleMobileMenu, isMobileMenuOpen = false }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 sm:px-6 backdrop-blur-md shadow-xs transition-all">
      {/* Left: Mobile Menu Toggle + Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Button */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all shadow-xs"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        )}

        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-50 transition-transform group-hover:scale-105 shrink-0">
            <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
              Forecast<span className="text-indigo-600">Flow</span>
            </span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
              AI Retail
            </span>
          </div>
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Account / Auth Actions */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-2.5 pl-2 border-l border-slate-200/80">
              <div
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold text-xs sm:text-sm shadow-xs ring-2 ring-indigo-100 shrink-0"
                title={user?.full_name || 'User'}
              >
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left max-w-[160px] lg:max-w-[220px]">
                <span className="text-xs font-bold text-slate-900 leading-tight truncate">
                  {user?.full_name}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {user?.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-[0.98]"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign in</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
