import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { LandingPage } from '../pages/LandingPage';
import { ProductsPage } from '../pages/catalog/ProductsPage';
import { CategoriesPage } from '../pages/catalog/CategoriesPage';
import { SuppliersPage } from '../pages/catalog/SuppliersPage';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { SalesPage } from '../pages/sales/SalesPage';
import { PurchasesPage } from '../pages/purchases/PurchasesPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ForecastPage } from '../pages/forecasting/ForecastPage';
import { IntelligencePage } from '../pages/intelligence/IntelligencePage';
import { RecommendationsPage } from '../pages/recommendations/RecommendationsPage';
import { DemoPage } from '../pages/demo/DemoPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Layers, Sparkles, ArrowRight } from 'lucide-react';

/**
 * RootRoute: If the user is authenticated, route them to /dashboard.
 * Otherwise, welcome visitors with the modern SaaS Landing Page.
 */
function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        <p className="text-xs font-semibold text-slate-500">Loading ForecastFlow...</p>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

/**
 * DemoRoute: Allows both authenticated users (in MainLayout) and prospective
 * visitors (with an open SaaS header) to explore the Kirana store playbook.
 */
function DemoRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <DemoPage />
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Floating Glass Navigation Bar (Matches Landing Page exactly) */}
      <header className="sticky top-3 sm:top-4 z-50 w-full px-3 sm:px-6 pointer-events-none">
        <div className="mx-auto max-w-6xl pointer-events-auto">
          <div className="flex h-16 items-center justify-between rounded-2xl border border-slate-200/90 bg-white/90 px-4 sm:px-6 backdrop-blur-xl shadow-lg shadow-slate-900/5 ring-1 ring-black/5 transition-all">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 text-white shadow-sm shadow-indigo-500/25 ring-1 ring-black/5 transition-transform group-hover:scale-105">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Forecast<span className="text-indigo-600">Flow</span>
                </span>
                <span className="hidden sm:inline-block rounded-md bg-indigo-50 border border-indigo-100/90 px-2 py-0.5 text-xs font-bold text-indigo-700 tracking-wide">
                  AI RETAIL
                </span>
              </div>
            </Link>

            {/* Center Navigation Track (Pill Island) */}
            <nav className="hidden md:flex items-center gap-1.5 rounded-xl bg-slate-100/80 p-1.5 border border-slate-200/60 shadow-inner">
              <Link
                to="/#features"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3.5 py-1.5 rounded-lg transition-all"
              >
                Features
              </Link>
              <Link
                to="/#how-it-works"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3.5 py-1.5 rounded-lg transition-all"
              >
                How It Works
              </Link>
              <Link
                to="/#kirana"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3.5 py-1.5 rounded-lg transition-all"
              >
                Kirana Store
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 bg-white border border-indigo-200/80 shadow-xs px-3.5 py-1.5 rounded-lg transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Interactive Demo</span>
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 px-4.5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:scale-102 active:scale-98"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <DemoPage />
      </main>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Root Route (Landing for guests, Dashboard for logged-in users) */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/welcome" element={<LandingPage />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Demo Walkthrough Route (Accessible publicly or in dashboard) */}
      <Route path="/demo" element={<DemoRoute />} />

      {/* Protected Application Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/system" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Fallback Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

