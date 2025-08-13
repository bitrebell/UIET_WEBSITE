import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './contexts/AuthContext';

// Layout Components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardRedirect from './components/auth/DashboardRedirect';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

// Lazy load pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Dashboard Pages (commented out for now)
// const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));

// Student Pages (commented out for now)
// const NotesPage = React.lazy(() => import('./pages/notes/NotesPage'));
// const NotificationsPage = React.lazy(() => import('./pages/notifications/NotificationsPage'));
// const MerchandisePage = React.lazy(() => import('./pages/merchandise/MerchandisePage'));
// const ProductDetailPage = React.lazy(() => import('./pages/merchandise/ProductDetailPage'));
// const OrdersPage = React.lazy(() => import('./pages/orders/OrdersPage'));

// Teacher Pages (commented out for now)
// const TeacherNotesPage = React.lazy(() => import('./pages/teacher/NotesPage'));
// const TeacherNotificationsPage = React.lazy(() => import('./pages/teacher/NotificationsPage'));

// Admin Pages (commented out for now)
// const AdminUsersPage = React.lazy(() => import('./pages/admin/UsersPage'));
// const AdminNotesPage = React.lazy(() => import('./pages/admin/NotesPage'));
// const AdminNotificationsPage = React.lazy(() => import('./pages/admin/NotificationsPage'));
// const AdminMerchandisePage = React.lazy(() => import('./pages/admin/MerchandisePage'));
// const AdminOrdersPage = React.lazy(() => import('./pages/admin/OrdersPage'));
// const AdminAnalyticsPage = React.lazy(() => import('./pages/admin/AnalyticsPage'));

// Error Pages (commented out for now)
// const NotFoundPage = React.lazy(() => import('./pages/error/NotFoundPage'));

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          {/* Dashboard Redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Role-specific Dashboards */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute role="student">
                  <StudentDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute role="teacher">
                  <TeacherDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute role="admin">
                  <AdminDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* Common Protected Routes - Redirects for now */}
          <Route
            path="/profile"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Student Routes - Redirects for now */}
          <Route
            path="/notes"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/notifications"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/merchandise"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/merchandise/:id"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/orders"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Teacher Routes - Redirects for now */}
          <Route
            path="/teacher/notes"
            element={<Navigate to="/teacher/dashboard" replace />}
          />
          <Route
            path="/teacher/notifications"
            element={<Navigate to="/teacher/dashboard" replace />}
          />

          {/* Admin Routes - Redirects for now */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/users"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/notes"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/notifications"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/merchandise"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/orders"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/analytics"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
