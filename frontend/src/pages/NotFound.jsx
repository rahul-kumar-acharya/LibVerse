import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100/40 dark:border-rose-900/30 mb-6 animate-bounce">
        <AlertCircle className="w-10 h-10" />
      </div>
      
      <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-50 tracking-tight">
        404 - Page Not Found
      </h2>
      <p className="text-sm text-slate-550 dark:text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
        Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <Link to="/" className="mt-8">
        <Button icon={Home}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
