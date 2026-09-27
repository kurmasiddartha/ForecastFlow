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
import { PublicNavbar } from '../components/layout/PublicNavbar';

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
      {/* Top Floating Glass Navigation Bar */}
      <PublicNavbar />
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

