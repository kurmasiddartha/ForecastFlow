import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { healthService } from '../services/healthService';
import { useAuth } from '../context/AuthContext';

export function MainLayout({ children }) {
  const [serverStatus, setServerStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Close mobile drawer automatically when route changes
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  const fetchHealth = async () => {
    setIsChecking(true);
    try {
      const data = await healthService.checkRootHealth();
      setServerStatus(data);
    } catch (err) {
      setServerStatus({ status: 'unreachable', error: err.message });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Responsive Header */}
      <Header
        onToggleMobileMenu={() => setIsMobileDrawerOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileDrawerOpen}
      />

      <div className="flex flex-1 relative">
        {/* Responsive Sidebar (Desktop sticky + Mobile slide-over drawer) */}
        <Sidebar
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto p-3.5 sm:p-5 lg:p-6 xl:p-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl w-full">
            {children || (
              <Outlet
                context={{ serverStatus, isChecking, refreshHealth: fetchHealth }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar (Handheld Phone UX) */}
      {isAuthenticated && (
        <MobileBottomNav
          onOpenMenu={() => setIsMobileDrawerOpen(true)}
          isMenuOpen={isMobileDrawerOpen}
        />
      )}
    </div>
  );
}
