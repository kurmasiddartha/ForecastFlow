import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Cpu,
  PackageCheck,
  Menu,
} from 'lucide-react';

export function MobileBottomNav({ onOpenMenu, isMenuOpen }) {
  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', to: '/products', icon: Box },
    { name: 'Forecast', to: '/forecast', icon: Cpu },
    { name: 'Restock', to: '/recommendations', icon: PackageCheck },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-slate-200/90 backdrop-blur-lg shadow-lg shadow-slate-900/10 px-2 py-1.5 flex items-center justify-around"
      aria-label="Mobile Bottom Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center p-1 rounded-lg transition-colors ${
                    isActive ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/60' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
              </>
            )}
          </NavLink>
        );
      })}

      {/* More / Menu Drawer Trigger */}
      <button
        type="button"
        onClick={onOpenMenu}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          isMenuOpen
            ? 'text-indigo-600 font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
        aria-label="Open full menu"
      >
        <div
          className={`flex items-center justify-center p-1 rounded-lg transition-colors ${
            isMenuOpen ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/60' : ''
          }`}
        >
          <Menu className="h-4 w-4" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">More</span>
      </button>
    </nav>
  );
}
