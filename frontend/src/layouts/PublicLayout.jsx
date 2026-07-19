import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Library, Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import Button from '../components/Button';

const PublicLayout = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/services', label: 'Services' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900/60">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-650/10">
              <Library className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">LibVerse</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-4">

            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" icon={ArrowRight}>
                  Portal Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu triggers */}
          <div className="flex items-center gap-3 md:hidden">
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-55 dark:hover:bg-slate-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-18 inset-x-0 bottom-0 bg-white dark:bg-slate-950 z-35 flex flex-col p-6 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-5 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-650"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="border-t border-slate-100 dark:border-slate-900/60 pt-6 flex flex-col gap-3">
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full" icon={ArrowRight}>
                  Portal Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Outlet Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900/50 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Slogan */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-650 rounded-xl text-white">
                <Library className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg uppercase">LibVerse</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Empowering students and faculty with accessible, high-quality digital resources, study rooms, reference guidance, and catalog management systems.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm text-slate-655 dark:text-slate-400 font-semibold">
              <li><Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-indigo-600 transition-colors">Services</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Library Hours */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Library Hours</h4>
            <ul className="space-y-2 text-sm text-slate-650 dark:text-slate-400 font-medium">
              <li>Monday - Friday: <span className="font-bold text-slate-800 dark:text-slate-300">9:00 AM - 6:00 PM</span></li>
              <li>Saturday: <span className="font-bold text-slate-800 dark:text-slate-300">10:00 AM - 4:00 PM</span></li>
              <li>Sunday: <span className="text-rose-500 font-bold">Closed</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-slate-200 dark:border-slate-900/60 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} LibVerse Portal System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
