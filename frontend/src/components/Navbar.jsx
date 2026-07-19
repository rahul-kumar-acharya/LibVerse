import React from 'react';
import { Menu, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onMobileToggle }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/60 shadow-sm shadow-slate-100/10 dark:shadow-none">
      {/* Left side: Hamburger and title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-50 leading-tight">
            Library Dashboard
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back, {user?.first_name || user?.username}
          </p>
        </div>
      </div>

      {/* Right side: quick controls & profile card */}
      <div className="flex items-center gap-4">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800/60">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none">
              {user?.student_profile?.name || user?.first_name || user?.username}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              {user?.role}
            </span>
          </div>

          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/40 dark:border-indigo-900/30">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
