import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Loader from './components/Loader';

// Import layouts (keep layouts static to avoid shell layout flashing)
import Layout from './layouts/Layout';
import PublicLayout from './layouts/PublicLayout';

// Import Route Guards
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all page views to enable code-splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Books = lazy(() => import('./pages/Books'));
const AddBook = lazy(() => import('./pages/AddBook'));
const EditBook = lazy(() => import('./pages/EditBook'));
const Students = lazy(() => import('./pages/Students'));
const IssueBook = lazy(() => import('./pages/IssueBook'));
const Categories = lazy(() => import('./pages/Categories'));
const IssuedBooks = lazy(() => import('./pages/IssuedBooks'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Public Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
        <Router>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[60vh] w-full">
                <Loader size="lg" />
              </div>
            }
          >
            <Routes>
              {/* Public Informational Site */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="services" element={<Services />} />
                <Route path="contact" element={<Contact />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>

              {/* Secure app routes layout (mounted at /dashboard) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Available for both student and admin */}
                <Route index element={<Dashboard />} />
                <Route path="books" element={<Books />} />
                <Route path="profile" element={<Profile />} />

                {/* Admin Only routes protected by adminOnly check */}
                <Route
                  path="books/add"
                  element={
                    <ProtectedRoute adminOnly>
                      <AddBook />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="books/edit/:id"
                  element={
                    <ProtectedRoute adminOnly>
                      <EditBook />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="students"
                  element={
                    <ProtectedRoute adminOnly>
                      <Students />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="issue"
                  element={
                    <ProtectedRoute adminOnly>
                      <IssueBook />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="categories"
                  element={
                    <ProtectedRoute adminOnly>
                      <Categories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute adminOnly>
                      <IssuedBooks />
                    </ProtectedRoute>
                  }
                />

                {/* 404 handler inside layout context */}
                <Route path="*" element={<NotFound />} />
              </Route>
              
              {/* Generic wildcard 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
