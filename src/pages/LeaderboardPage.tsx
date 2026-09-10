import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { LoadingSpinner } from '@/components/ui/Common';
import type { LeaderboardEntry } from '@/types';

export function LeaderboardPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'global' | 'weekly' | 'friends'>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);

      // Get real user profiles (limited fields for leaderboard)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, age_group, fitness_level, total_points, current_streak, longest_streak, level')
        .order('total_points', { ascending: false });

      // Get sample leaderboard entries
      const { data: sampleData } = await supabase
        .from('leaderboard_sample')
        .select('*')
        .order('total_points', { ascending: false });

      const realEntries: LeaderboardEntry[] = (profileData ?? []).map((p) => ({
        ...p,
        isCurrentUser: p.id === user.id,
        weekly_points: 0,
      })) as LeaderboardEntry[];

      const sampleEntries: LeaderboardEntry[] = (sampleData ?? []).map((s) => ({
        id: s.id,
        full_name: s.full_name,
        age_group: s.age_group,
        fitness_level: s.fitness_level,
        total_points: s.total_points,
        current_streak: s.current_streak,
        longest_streak: s.longest_streak,
        level: s.level,
        weekly_points: s.weekly_points,
      })) as LeaderboardEntry[];

      // Merge and sort by points
      let combined = [...realEntries, ...sampleEntries];
      combined.sort((a, b) => b.total_points - a.total_points);

      if (tab === 'weekly') {
        combined = combined.map((e) => ({
          ...e,
          total_points: e.weekly_points || Math.round(e.total_points * 0.15),
        }));
        combined.sort((a, b) => b.total_points - a.total_points);
      }

      if (tab === 'friends') {
        // For demo, just show a subset
        combined = combined.slice(0, 8);
      }

      setEntries(combined.slice(0, 20));
      setLoading(false);
    })();
  }, [user, tab, isSupabaseConfigured]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-8">
        <div className="card p-8 text-center">
          <TrendingUp className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your profile first</h2>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary mt-2">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'global' as const, label: 'Global', icon: Globe },
    { key: 'weekly' as const, label: 'Weekly', icon: TrendingUp },
    { key: 'friends' as const, label: 'Friends', icon: Users },
  ];

  const currentRank = entries.findIndex((e) => e.isCurrentUser) + 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500 mt-1">See how you rank against the FitMate community</p>
      </div>

      {/* Your Rank */}
      {currentRank > 0 && (
        <div className="card p-5 bg-gradient-to-r from-primary-600 to-primary-700 border-0 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-100">Your Ranking</p>
              <p className="text-3xl font-bold text-white">#{currentRank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-100">Your Points</p>
              <p className="text-3xl font-bold text-white">{profile.total_points}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner label="Loading leaderboard..." />
        </div>
      ) : entries.length > 0 ? (
        <LeaderboardTable entries={entries} />
      ) : (
        <div className="card p-8 text-center">
          <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No leaderboard data available yet.</p>
        </div>
      )}
    </div>
  );
}
