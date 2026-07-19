import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={mobileOpen} onClose={closeMobileSidebar} />

      {/* Main content wrapper */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar onMobileToggle={toggleMobileSidebar} />

        {/* Content Outlet */}
        <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-200">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="py-4 border-t border-slate-100 dark:border-slate-800/40 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} LibVerse Portal System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Layout;
