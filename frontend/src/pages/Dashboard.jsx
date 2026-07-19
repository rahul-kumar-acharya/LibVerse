import React, { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Undo2,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import Loader from '../components/Loader';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary-brown text-white p-3 rounded-xl shadow-lg border-0 text-xs font-semibold leading-relaxed">
        <p className="opacity-80 uppercase tracking-wider text-[9px] mb-1">{payload[0].payload.category}</p>
        <p className="text-xs font-extrabold">{payload[0].value} Books</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-10">
        <p className="text-rose-500">Failed to load dashboard metrics. Please reload the page.</p>
      </div>
    );
  }

  // Cards layout configurations (exactly 4 cards as requested)
  const cards = [
    {
      title: 'Total Books',
      value: stats.books_count,
      icon: BookOpen,
      color: 'text-primary-brown',
      bgColor: 'bg-primary-brown/10',
      delta: '+8% library growth',
    },
    {
      title: 'Available Copies',
      value: stats.available_count,
      icon: CheckCircle,
      color: 'text-olive-green',
      bgColor: 'bg-olive-green/10',
      delta: '92% stock ratio',
    },
    {
      title: 'Issued Copies',
      value: stats.issued_count,
      icon: AlertTriangle,
      color: 'text-amber-700',
      bgColor: 'bg-amber-700/10',
      delta: '8% lending index',
    },
    {
      title: 'Students Registered',
      value: stats.students_count,
      icon: Users,
      color: 'text-olive-green',
      bgColor: 'bg-olive-green/10',
      delta: '+12% new profiles',
      adminOnly: true,
    },
  ];

  // Filtering cards based on user role
  const visibleCards = cards.filter(card => !card.adminOnly || isAdmin());

  // Pie chart data for Availability vs Issued using natural palette colors
  const availabilityData = [
    { name: 'Available', value: stats.available_count, color: '#6B7A4E' }, // Olive Green
    { name: 'Issued', value: stats.issued_count, color: '#3E2F26' },     // Dark Brown
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Greetings bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isAdmin() ? 'Librarian Dashboard' : 'Student Portal Dashboard'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time library statistics, stock ratios, and recent operations log.
            {isAdmin() && (
              <span className="ml-2 font-semibold text-olive-green">
                (Today: {stats.today_issue_count} issues, {stats.today_return_count} returns)
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardStats}>
          Refresh Metrics
        </Button>
      </div>

      {/* Grid count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/70 p-6 flex flex-col justify-between min-h-[140px] rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-slate-300/80 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-405 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-800 leading-tight">
                  {card.value}
                </span>
                {card.delta && (
                  <span className="text-[9px] font-bold text-olive-green bg-olive-green/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {card.delta}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Books by Category Bar Chart */}
        <div className="glass-card p-6 xl:col-span-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-50 mb-6">
            Books Count by Category
          </h3>
          <div className="h-80 w-full">
            {stats.category_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B7A4E" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6B7A4E" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#6B7A4E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No book data to display.
              </div>
            )}
          </div>
        </div>

        {/* Inventory Stock Pie Chart */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-50 mb-6">
            Stock Availability Ratio
          </h3>
          <div className="h-60 w-full flex-1 relative">
            {stats.books_count > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={availabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {availabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No inventory data to display.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent History log lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Issues */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-50">
                {isAdmin() ? 'Recent Book Issues' : 'My Active Issues'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Showing last 5 checkouts</p>
            </div>
            {isAdmin() && (
              <Link to="/dashboard/reports">
                <Button variant="outline" size="sm" icon={ChevronRight}>
                  View All
                </Button>
              </Link>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            {stats.recent_issues.length > 0 ? (
              stats.recent_issues.map((tr) => (
                <div key={tr.id} className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100/50 dark:border-slate-800/30">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-850 dark:text-slate-100 max-w-[240px] truncate">
                      {tr.book.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Issued to: <span className="font-medium text-slate-650 dark:text-slate-300">{tr.student.name}</span> ({tr.student.roll_number})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      Due: {tr.return_date}
                    </span>
                    {parseFloat(tr.potential_fine) > 0 && (
                      <p className="text-[10px] text-rose-500 font-bold mt-1.5">
                        Fine: ₹{tr.potential_fine}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-10 text-xs text-slate-400">
                No active issues.
              </div>
            )}
          </div>
        </div>

        {/* Recent Returns */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-50">
                {isAdmin() ? 'Recent Book Returns' : 'My Recent Returns'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Showing last 5 completed actions</p>
            </div>
            {isAdmin() && (
              <Link to="/dashboard/reports">
                <Button variant="outline" size="sm" icon={ChevronRight}>
                  View All
                </Button>
              </Link>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            {stats.recent_returns.length > 0 ? (
              stats.recent_returns.map((tr) => (
                <div key={tr.id} className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100/50 dark:border-slate-800/30">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-850 dark:text-slate-100 max-w-[240px] truncate">
                      {tr.book.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Returned by: <span className="font-medium text-slate-650 dark:text-slate-300">{tr.student.name}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Returned
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Fine paid: <span className={parseFloat(tr.fine) > 0 ? 'text-rose-500 font-bold' : 'text-slate-500'}>₹{tr.fine}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-10 text-xs text-slate-400">
                No recent returns.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
