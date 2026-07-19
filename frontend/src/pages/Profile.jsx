import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, Mail, Phone, GraduationCap, Award, Shield } from 'lucide-react';

const Profile = () => {
  const { user, isStudent, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">My Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View your account credentials and academic profile details.
        </p>
      </div>

      {/* Profile Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar Card */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/40 dark:border-indigo-900/30 mb-4 shadow-lg shadow-indigo-650/5">
            <User className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-50">
            {user.student_profile?.name || user.first_name || user.username}
          </h3>
          <span className="text-xs text-indigo-600 dark:text-indigo-455 font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full mt-2">
            {user.role}
          </span>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            Member since: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Right Side: Information Card */}
        <div className="glass-card p-6 md:col-span-2 space-y-6">
          
          {/* Account Credentials */}
          <div>
            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" /> Account Security Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400">Username</span>
                <p className="font-semibold text-sm text-slate-750 dark:text-slate-200 mt-1">{user.username}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Email Address</span>
                <p className="font-semibold text-sm text-slate-750 dark:text-slate-200 mt-1">{user.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Student Profile Information */}
          {isStudent() && user.student_profile && (
            <div className="pt-2 animate-in fade-in duration-200">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-500" /> Student Profile Details
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-xs text-slate-400">Student Roll Number</span>
                  <p className="font-semibold text-sm text-slate-750 dark:text-slate-200 mt-1">{user.student_profile.roll_number}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Academic Department</span>
                  <p className="font-semibold text-sm text-slate-750 dark:text-slate-200 mt-1">{user.student_profile.department}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Current Semester</span>
                  <p className="font-semibold text-sm text-slate-750 dark:text-slate-200 mt-1">{user.student_profile.semester}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Contact Phone</span>
                  <p className="font-semibold text-sm text-slate-750 dark:text-slate-200 mt-1">{user.student_profile.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Admin Metadata */}
          {isAdmin() && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" /> Administrative Access Permissions
              </h4>
              <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-2 mt-1">
                <li>Ability to create, update, and remove cataloged books & images.</li>
                <li>Add/edit/delete student lists and contact metadata records.</li>
                <li>Lend books, register checkouts, process returns, and log fine collections.</li>
                <li>Generate category reports and review overdue analytics.</li>
              </ul>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;
