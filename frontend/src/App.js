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
        <CircularProgress size={40} />
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

          {/* Common Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/notes"
            element={
              <ProtectedRoute roles={['student']}>
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchandise"
            element={
              <ProtectedRoute>
                <MerchandisePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchandise/:id"
            element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/notes"
            element={
              <ProtectedRoute roles={['teacher', 'admin']}>
                <TeacherNotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/notifications"
            element={
              <ProtectedRoute roles={['teacher', 'admin']}>
                <TeacherNotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notes"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminNotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminNotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/merchandise"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminMerchandisePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
