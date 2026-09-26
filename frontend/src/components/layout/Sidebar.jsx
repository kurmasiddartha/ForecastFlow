import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Tags,
  Truck,
  Boxes,
  TrendingUp,
  ShoppingBag,
  Cpu,
  BrainCircuit,
  PackageCheck,
  Sparkles,
  Layers,
  X,
  LogOut,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { name: 'Products', to: '/products', icon: Box },
      { name: 'Inventory & Stock', to: '/inventory', icon: Boxes },
      { name: 'Categories', to: '/categories', icon: Tags },
      { name: 'Suppliers', to: '/suppliers', icon: Truck },
      { name: 'Purchases', to: '/purchases', icon: ShoppingBag },
    ],
  },
  {
    title: 'Sales',
    items: [
      { name: 'Sales Orders', to: '/sales', icon: TrendingUp },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { name: 'Demand Forecast', to: '/forecast', icon: Cpu },
      { name: 'Inventory Intelligence', to: '/intelligence', icon: BrainCircuit },
      { name: 'Restock Recommendations', to: '/recommendations', icon: PackageCheck },
    ],
  },
];

export function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const navContent = (
    <div className="space-y-6">
      {navigationGroups.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
            {group.title}
          </p>
          <div className="mt-2 space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-200/60 font-bold'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-indigo-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}

      {/* Demo Quick Link */}
      <div className="pt-2 border-t border-slate-100">
        <Link
          to="/demo"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 px-3 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100/70 transition-colors"
        >
          <Store className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Kirana Demo Playbook</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop & Laptop Sidebar: Sticky on >= lg screens */}
      <aside className="hidden lg:flex w-60 xl:w-64 flex-col border-r border-slate-200/80 bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 shrink-0">
        {navContent}
      </aside>

      {/* 2. Mobile & Tablet Slide-Over Drawer: Active when isOpen on < lg screens */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4">
              <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 text-white shadow-xs">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900">
                    Forecast<span className="text-indigo-600">Flow</span>
                  </span>
                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/60 uppercase">
                    AI
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Profile Card inside Drawer */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold text-sm shadow-xs ring-2 ring-indigo-100">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.full_name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-medium">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable Nav Content */}
            <div className="flex-1 overflow-y-auto p-4">{navContent}</div>

            {/* Drawer Footer with Logout */}
            {isAuthenticated && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-xs"
                >
                  <LogOut className="h-4 w-4 text-rose-600" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
