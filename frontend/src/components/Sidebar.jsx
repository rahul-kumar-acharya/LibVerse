import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  KeyRound,
  Tags,
  BarChart3,
  User,
  LogOut,
  Sun,
  Moon,
  Library
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onClose }) => {
  const { logout, isAdmin } = useAuth();

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/books', label: 'Books', icon: BookOpen },
    { to: '/dashboard/students', label: 'Students', icon: Users },
    { to: '/dashboard/issue', label: 'Issue Book', icon: KeyRound },
    { to: '/dashboard/categories', label: 'Categories', icon: Tags },
    { to: '/dashboard/reports', label: 'Transactions', icon: BarChart3 },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/books', label: 'Books List', icon: BookOpen },
    { to: '/dashboard/profile', label: 'My Profile', icon: User },
  ];

  const links = isAdmin() ? adminLinks : studentLinks;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/60 shadow-sm w-64 transition-all">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/10">
          <Library className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-slate-850 dark:text-slate-50 text-base leading-tight">LibVerse</h2>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">
            {isAdmin() ? 'Administrator' : 'Student Portal'}
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-semibold border-l-4 border-transparent transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive
                    ? 'bg-light-beige text-primary-brown border-l-olive-green rounded-r-xl rounded-l-none pl-3'
                    : 'text-slate-600 hover:bg-light-beige/70 hover:text-primary-brown hover:border-l-olive-green hover:rounded-r-xl hover:rounded-l-none hover:pl-3'
                }`
              }
              end={link.to === '/dashboard'}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-2">

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-3.5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-20 w-64 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Body */}
          <div className="relative flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 h-full shadow-2xl animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
