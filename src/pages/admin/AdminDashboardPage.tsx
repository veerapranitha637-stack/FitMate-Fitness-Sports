import { useState, useEffect } from 'react';
import { Users, Activity, Zap, Trophy, Calendar, UserCheck, FileBarChart, BookOpen, Apple } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';
import type { AdminStats } from '@/types';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<{ full_name: string; email: string; created_at: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');
      const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user').eq('is_active', true);
      const { count: totalActivities } = await supabase.from('activities').select('*', { count: 'exact', head: true });
      const { count: activeChallenges } = await supabase.from('challenges').select('*', { count: 'exact', head: true });
      const { count: upcomingEvents } = await supabase.from('sports_events').select('*', { count: 'exact', head: true }).eq('status', 'upcoming');
      const { count: totalRegistrations } = await supabase.from('event_registrations').select('*', { count: 'exact', head: true });
      const { count: totalFitnessTips } = await supabase.from('fitness_information').select('*', { count: 'exact', head: true });
      const { count: totalFoodRecs } = await supabase.from('food_recommendations').select('*', { count: 'exact', head: true });

      const { data: profilesData } = await supabase.from('profiles').select('total_points').eq('role', 'user');
      const totalFitPoints = (profilesData ?? []).reduce((s, p) => s + (p.total_points ?? 0), 0);

      setStats({
        totalUsers: totalUsers ?? 0,
        activeUsers: activeUsers ?? 0,
        totalActivities: totalActivities ?? 0,
        totalFitPoints,
        activeChallenges: activeChallenges ?? 0,
        upcomingEvents: upcomingEvents ?? 0,
        totalRegistrations: totalRegistrations ?? 0,
        totalFitnessTips: totalFitnessTips ?? 0,
        totalFoodRecs: totalFoodRecs ?? 0,
      });

      const { data: recent } = await supabase
        .from('profiles')
        .select('full_name, email, created_at')
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentUsers((recent ?? []) as { full_name: string; email: string; created_at: string }[]);

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Users', value: stats?.activeUsers ?? 0, icon: UserCheck, color: 'bg-green-500' },
    { label: 'Total Activities', value: stats?.totalActivities ?? 0, icon: Activity, color: 'bg-primary-500' },
    { label: 'Total FitPoints', value: stats?.totalFitPoints ?? 0, icon: Zap, color: 'bg-amber-500' },
    { label: 'Active Challenges', value: stats?.activeChallenges ?? 0, icon: Trophy, color: 'bg-secondary-500' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents ?? 0, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Event Registrations', value: stats?.totalRegistrations ?? 0, icon: FileBarChart, color: 'bg-orange-500' },
    { label: 'Fitness Tips', value: stats?.totalFitnessTips ?? 0, icon: BookOpen, color: 'bg-teal-500' },
    { label: 'Food Recs', value: stats?.totalFoodRecs ?? 0, icon: Apple, color: 'bg-pink-500' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your FitMate platform</p>
      </div>

      <div className="card p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">Admin / Event Organizer</p>
            <p className="text-gray-400 text-sm">You have full access to manage the platform</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="card p-5 animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Users</h2>
        <div className="card overflow-hidden">
          {recentUsers.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentUsers.map((u, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-bold text-sm">
                    {u.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{u.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No users yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
