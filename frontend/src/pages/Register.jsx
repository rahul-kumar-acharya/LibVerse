import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Library, BookOpen } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import SEO from '../components/SEO';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { user, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Register Form State
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    roll_number: '',
    department: '',
    semester: '',
    phone: '',
  });
  const [registerErrors, setRegisterErrors] = useState({});

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    setRegisterErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!registerData.username) errors.username = 'Username is required';
    if (!registerData.email) errors.email = 'Email address is required';
    if (!registerData.password) errors.password = 'Password is required';
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!registerData.name) errors.name = 'Full name is required';
    if (!registerData.roll_number) errors.roll_number = 'Roll number is required';
    if (!registerData.department) errors.department = 'Department is required';
    if (!registerData.semester) errors.semester = 'Semester is required';
    if (!registerData.phone) errors.phone = 'Phone number is required';

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      showToast('Please correct form errors before submitting.', 'error');
      return;
    }

    setLoading(true);
    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      showToast('Registration successful! You can now log in.', 'success');
      navigate('/login');
    } else {
      setRegisterErrors(result.errors || {});
      showToast(result.error || 'Registration failed.', 'error');
    }
  };

  return (
    <div className="py-16 md:py-24 bg-slate-50 flex items-center justify-center px-4">
      <SEO title="Register" description="Register a new student account to access LibVerse catalogs and borrow features." />
      {/* Outer container applying the separation gap */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 animate-in fade-in duration-300">
        
        {/* Left column: Welcome / branding */}
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
              Join Our Academic Community.
            </h2>
            <p className="text-slate-100/90 text-sm mt-3 leading-relaxed">
              Create an account to browse resource catalogs, keep track of due dates, receive instant notification updates, and manage issues.
            </p>
          </div>

          <div className="relative z-10 hidden md:block">
            <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 text-xs text-slate-100/90 leading-relaxed">
              <BookOpen className="w-6 h-6 text-light-beige flex-shrink-0" />
              <span>Registering binds your email to pre-authorized student listings managed by the college librarians.</span>
            </div>
          </div>
        </div>

        {/* Right column: Register form - Internal panel scroll has been removed */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white dark:bg-slate-900/40 border border-slate-200/80 rounded-3xl shadow-md flex flex-col justify-center">
          
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                Student Registration
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Create a student account to access the library portal
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Username"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  placeholder="student_user"
                  error={registerErrors.username}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="email@college.edu"
                  error={registerErrors.email}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Create password"
                  error={registerErrors.password}
                  required
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Re-enter password"
                  error={registerErrors.confirmPassword}
                  required
                />
              </div>

              <hr className="border-slate-100 dark:border-slate-800 my-2" />
              <p className="text-xs font-bold text-olive-green uppercase tracking-wider">
                Academic & Profile Information
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  placeholder="Enter full name"
                  error={registerErrors.name}
                  required
                />

                <Input
                  label="Roll Number"
                  name="roll_number"
                  value={registerData.roll_number}
                  onChange={handleRegisterChange}
                  placeholder="e.g. CS202301"
                  error={registerErrors.roll_number}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Department"
                  name="department"
                  value={registerData.department}
                  onChange={handleRegisterChange}
                  placeholder="e.g. Computer Science"
                  error={registerErrors.department}
                  required
                />

                <Input
                  label="Semester"
                  name="semester"
                  value={registerData.semester}
                  onChange={handleRegisterChange}
                  placeholder="e.g. 6th"
                  error={registerErrors.semester}
                  required
                />
              </div>

              <Input
                label="Phone Number"
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                placeholder="e.g. 9876543210"
                error={registerErrors.phone}
                required
              />

              <Button
                type="submit"
                className="w-full py-2.5 mt-4"
                loading={loading}
              >
                Register Account
              </Button>
            </form>

            <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800/60 pt-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-olive-green hover:text-primary-brown hover:underline focus:outline-none"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
