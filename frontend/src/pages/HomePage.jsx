import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  CheckCircle,
  Database,
  Layers,
  Lock,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  User,
  Zap,
  Box,
  Boxes,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export function HomePage() {
  const { user } = useAuth();
  const { serverStatus, isChecking, refreshHealth } = useOutletContext();
  const isHealthy = serverStatus?.status === 'healthy';
  const dbHealth = serverStatus?.database;
  const isDbConnected = dbHealth?.status === 'connected';

  const layers = [
    {
      title: 'Frontend Client',
      badge: 'Active (Phase 1)',
      color: 'border-sky-500 text-sky-600 bg-sky-50',
      description: 'React 18 + Vite with Tailwind CSS, React Router, modular service abstractions, and layout architecture.',
      details: ['Vite 5 Bundler', 'React Router v6', 'Modular Layout & Services'],
    },
    {
      title: 'FastAPI REST Backend',
      badge: 'Active (Phase 1)',
      color: 'border-emerald-500 text-emerald-600 bg-emerald-50',
      description: 'Layered Python backend with Pydantic schemas, centralized config, CORS, and health-check endpoints.',
      details: ['FastAPI 0.110+', 'Pydantic v2 Settings', 'Strict Layer Separation'],
    },
    {
      title: 'Data & MongoDB Atlas',
      badge: 'Active (Phase 2)',
      color: 'border-indigo-500 text-indigo-600 bg-indigo-50',
      description: 'Centralized async Motor connection pool, ping health check, and complete domain schemas for 9 collections.',
      details: ['Motor / PyMongo', '9 Collection Schemas', 'Optimized Compound Indexes'],
    },
    {
      title: 'Auth & Identity Security',
      badge: 'Active (Phase 3)',
      color: 'border-amber-500 text-amber-600 bg-amber-50',
      description: 'JWT Bearer authentication, bcrypt salted password hashing, route guard dependencies, and current-user session management.',
      details: ['Bcrypt 12-round Hashing', 'HS256 JWT Tokens', 'Protected Route Guards'],
    },
    {
      title: 'ML Forecasting Engine',
      badge: 'Planned (Phase 4)',
      color: 'border-purple-500 text-purple-600 bg-purple-50',
      description: 'Statistical baselines (Moving Average, Exponential Smoothing) followed by Regression and Time Series evaluation.',
      details: ['MAE / RMSE / MAPE Metrics', 'Safety Stock Restock Logic', 'Reproducible Pipeline'],
    },
  ];

  const phaseThreeDeliverables = [
    'Secure user registration with bcrypt salted password hashing (12 rounds)',
    'JWT Bearer token authentication with configurable expiration and claims',
    'Protected current-user endpoint (/api/v1/auth/me) with token decoding',
    'Strict input validation with email validation and minimum password complexity',
    'Frontend AuthContext with persistent session restoration and auto-logout on 401',
    'Protected route wrapper guarding core application layout and features',
    'Complete automated test suites verifying auth flows against live MongoDB Atlas',
  ];

  return (
    <div className="space-y-8">
      {/* Hero / Intro Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Phase 6 Active: Sales & Purchase Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.full_name || 'User'}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              ForecastFlow core operations active: Catalog, auditable stock ledger, sales order deduction, and supplier replenishment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshHealth}
              disabled={isChecking}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              Verify Connection
            </button>
          </div>
        </div>
      </div>

      {/* Live Infrastructure & Session Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Current Authenticated User */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active User
            </span>
            <User className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 truncate">
              {user?.full_name}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {user?.email}
          </p>
        </div>

        {/* Security / JWT Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Auth Guard
            </span>
            <Lock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">
              JWT Bearer
            </span>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Account: <span className="font-semibold text-slate-700">{user?.email}</span>
          </p>
        </div>

        {/* MongoDB Database Health */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Database
            </span>
            <Database className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 capitalize">
              {dbHealth?.status || (isChecking ? 'Checking...' : 'Pending')}
            </span>
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${isDbConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {isDbConnected ? `${dbHealth?.database} (${dbHealth?.latency_ms}ms)` : 'Atlas Cluster'}
          </p>
        </div>

        {/* Backend API */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              API Status
            </span>
            <Server className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 capitalize">
              {serverStatus?.status || (isChecking ? 'Checking...' : 'Offline')}
            </span>
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            v{serverStatus?.version || '0.1.0'} ({serverStatus?.environment || 'dev'})
          </p>
        </div>
      </div>

      {/* Core Operations Quick Navigation */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Core Inventory & Commercial Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/sales"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Sales Orders</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Record customer sales, auto-deduct inventory, and track revenues.
            </p>
          </Link>

          <Link
            to="/purchases"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600 group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Purchases & Restock</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Manage supplier purchase orders and automatically replenish stock.
            </p>
          </Link>

          <Link
            to="/inventory"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600 group-hover:scale-105 transition-transform">
                <Boxes className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Inventory & Ledger</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Track stock levels, low-stock warnings, and auditable movement logs.
            </p>
          </Link>

          <Link
            to="/products"
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 group-hover:scale-105 transition-transform">
                <Box className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Products Catalog</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Manage SKUs, categories, suppliers, cost & selling pricing.
            </p>
          </Link>
        </div>
      </div>

      {/* Architecture Layers */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Architecture Layer Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layers.map((layer) => (
            <div
              key={layer.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{layer.title}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${layer.color}`}>
                  {layer.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {layer.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {layer.details.map((detail) => (
                  <span
                    key={detail}
                    className="inline-flex items-center text-[11px] font-medium text-slate-600 bg-slate-100 rounded px-2 py-0.5"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 3 Deliverables Checklist */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Phase 3 Authentication Deliverables</h2>
        <p className="text-xs text-slate-500 mb-4">
          Isolated and reusable security architecture protecting endpoints and client routes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {phaseThreeDeliverables.map((item, index) => (
            <div key={index} className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
