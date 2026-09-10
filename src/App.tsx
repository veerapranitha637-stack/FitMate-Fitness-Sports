import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/layouts/AppLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ProfileSetupPage } from '@/pages/ProfileSetupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { RecommendationsPage } from '@/pages/RecommendationsPage';
import { ActivitiesPage } from '@/pages/ActivitiesPage';
import { ChallengesPage } from '@/pages/ChallengesPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { EventsPage } from '@/pages/EventsPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { FitAIPage } from '@/pages/FitAIPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminEventsPage } from '@/pages/admin/AdminEventsPage';
import { AdminFitnessInfoPage } from '@/pages/admin/AdminFitnessInfoPage';
import { AdminFoodPage } from '@/pages/admin/AdminFoodPage';
import { AdminChallengesPage } from '@/pages/admin/AdminChallengesPage';
import { AdminAnnouncementsPage } from '@/pages/admin/AdminAnnouncementsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminSportsPage } from '@/pages/admin/AdminSportsPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { NutritionPage } from '@/pages/NutritionPage';
import { FitnessTipsPage } from '@/pages/FitnessTipsPage';
import { LoadingSpinner } from '@/components/ui/Common';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, isDemoMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading, isDemoMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Verifying access..." />
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/admin/login" replace />;
  }

  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* User routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfileSetupPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/fitness-tips" element={<FitnessTipsPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/fitai" element={<FitAIPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/events" element={<AdminEventsPage />} />
        <Route path="/admin/fitness-info" element={<AdminFitnessInfoPage />} />
        <Route path="/admin/food" element={<AdminFoodPage />} />
        <Route path="/admin/challenges" element={<AdminChallengesPage />} />
        <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/sports" element={<AdminSportsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
