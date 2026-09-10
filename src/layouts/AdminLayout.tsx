import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  Megaphone,
  Users,
  Activity,
  FileBarChart,
  Settings,
  Shield,
  Heart,
  LogOut,
  Menu,
  X,
  BookOpen,
  Apple,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/helpers';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/fitness-info', icon: BookOpen, label: 'Fitness Information' },
  { to: '/admin/food', icon: Apple, label: 'Food & Nutrition' },
  { to: '/admin/challenges', icon: Trophy, label: 'Challenges' },
  { to: '/admin/sports', icon: Activity, label: 'Sports' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const Sidebar = (
    <div className="h-full flex flex-col bg-gray-900 w-64">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-800 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center border border-gray-700">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-white">FitMate</span>
          <p className="text-xs text-gray-400 -mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Admin Info */}
      {profile && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-white flex items-center justify-center font-bold text-sm">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
              <p className="text-xs text-gray-400">Admin / Event Organizer</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all w-full"
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
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 animate-slide-in">{Sidebar}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 bg-gray-900 border-b border-gray-800 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center border border-gray-700">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">FitMate Admin</span>
          </div>
          <div className="w-6" />
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
