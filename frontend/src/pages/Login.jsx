import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Library, BookOpen } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import SEO from '../components/SEO';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setLoginErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!loginData.username) errors.username = 'Username is required';
    if (!loginData.password) errors.password = 'Password is required';
    
    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

  	setLoading(true);
    const result = await login(loginData.username, loginData.password);
    setLoading(false);

    if (result.success) {
      showToast('Welcome back! Logged in successfully.', 'success');
      navigate(from, { replace: true });
    } else {
      showToast(result.error || 'Login failed.', 'error');
    }
  };

  return (
    <div className="py-16 md:py-24 bg-slate-50 flex items-center justify-center px-4">
      <SEO title="Sign In" description="Secure sign-in for the LibVerse Library Management System portal." />
      {/* Outer container applying the separation gap */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 animate-in fade-in duration-300">
        
        {/* Left column: Welcome / branding */}
        {/* 2. Added shadow-md and rounded corners explicitly to this panel */}
        <div className="w-full md:w-5/12 bg-primary-brown p-8 md:p-12 flex flex-col justify-between text-white relative rounded-3xl shadow-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-olive-green/20 to-primary-brown/65 pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Library className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg tracking-wide uppercase">LibVerse</span>
          </div>

          <div className="relative z-10 my-8 md:my-0">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
              Knowledge Hub at Your Fingertips.
            </h2>
            <p className="text-slate-100/90 text-sm mt-3 leading-relaxed">
              Access thousands of books, track your transaction records, verify active holdings, and calculate overdue status seamlessly.
            </p>
          </div>

          <div className="relative z-10 hidden md:block">
            <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 text-xs text-slate-100/90 leading-relaxed">
              <BookOpen className="w-6 h-6 text-light-beige flex-shrink-0" />
              <span>Standard student accounts let you view holdings and search, while librarians manage the master lists.</span>
            </div>
          </div>
        </div>

        {/* Right column: Login form */}
        {/* 3. Added border, shadow, and rounded-3xl to this panel to match */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white dark:bg-slate-900/40 border border-slate-200/80 rounded-3xl shadow-md flex flex-col justify-center">
          
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                Welcome Back
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Sign in to your library account to continue
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Username"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
                placeholder="Enter username"
                error={loginErrors.username}
                required
              />
              
              <Input
                label="Password"
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="Enter password"
                error={loginErrors.password}
                required
              />

              <Button
                type="submit"
                className="w-full py-2.5 mt-2"
                loading={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800/60 pt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Are you a student without an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-olive-green hover:text-primary-brown hover:underline focus:outline-none"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
