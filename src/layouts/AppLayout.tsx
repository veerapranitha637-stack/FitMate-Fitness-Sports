import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  Home,
  User,
  Activity,
  Sparkles,
  Trophy,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Bot,
  Settings,
  Heart,
  LogOut,
  Menu,
  Zap,
  Shield,
  Apple,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getLevelFromPoints } from '@/config/fitpoints';
import { cn } from '@/utils/helpers';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/activities', icon: Activity, label: 'Activities' },
  { to: '/recommendations', icon: Sparkles, label: 'AI Coach' },
  { to: '/nutrition', icon: Apple, label: 'Nutrition' },
  { to: '/fitness-tips', icon: BookOpen, label: 'Fitness Tips' },
  { to: '/challenges', icon: Trophy, label: 'Challenges' },
  { to: '/leaderboard', icon: TrendingUp, label: 'Leaderboard' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/events', icon: Calendar, label: 'Sports Events' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/fitai', icon: Bot, label: 'FitAI' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const mobileNavItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/activities', icon: Activity, label: 'Log' },
  { to: '/recommendations', icon: Sparkles, label: 'Coach' },
  { to: '/nutrition', icon: Apple, label: 'Food' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
];

export function AppLayout() {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const levelInfo = profile ? getLevelFromPoints(profile.total_points) : null;

  const visibleNavItems = isAdmin
    ? [...navItems, { to: '/admin', icon: Shield, label: 'Admin Panel' }]
    : navItems;

  const Sidebar = (
    <div className="h-full flex flex-col bg-white border-r border-gray-100 w-64">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-100 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-gray-900">FitMate</span>
          <p className="text-xs text-gray-400 -mt-0.5">Move • Improve • Achieve</p>
        </div>
      </div>

      {/* User Info */}
      {profile && levelInfo && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-bold text-sm">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{profile.full_name}</p>
              <p className="text-xs text-gray-400">Level {levelInfo.level} — {levelInfo.name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{profile.total_points} pts</span>
            {levelInfo.nextLevelPoints && <span>{levelInfo.nextLevelPoints} pts</span>}
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500" style={{ width: `${levelInfo.progressPercent}%` }} />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50',
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {Sidebar}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 animate-slide-in">{Sidebar}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">FitMate</span>
          </div>
          {profile && (
            <div className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              <Zap className="w-4 h-4" />
              {profile.total_points}
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-2 py-1.5 flex items-center justify-around">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors',
                  isActive ? 'text-primary-600' : 'text-gray-400',
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
