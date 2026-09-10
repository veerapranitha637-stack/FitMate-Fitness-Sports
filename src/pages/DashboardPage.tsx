import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Flame,
  Clock,
  Trophy,
  Sparkles,
  Plus,
  TrendingUp,
  Quote,
  ChevronRight,
  Award,
  Megaphone,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivities } from '@/hooks/useActivities';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { StatCard } from '@/components/StatCard';
import { ActivityCard } from '@/components/ActivityCard';
import { AddActivityModal } from '@/components/AddActivityModal';
import { LoadingSpinner } from '@/components/ui/Common';
import { getDailyMotivation, getStreakMessage, getLevelFromPoints } from '@/config/fitpoints';
import { isSameWeek, formatDate } from '@/utils/helpers';
import type { Announcement } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { profile, loading: authLoading, isDemoMode } = useAuth();
  const { activities, loading: activitiesLoading, saveActivity } = useActivities();
  const [showAddModal, setShowAddModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3);
      setAnnouncements((data ?? []) as Announcement[]);
    })();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading your dashboard..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-8">
        <div className="card p-8 text-center">
          <Sparkles className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your fitness profile</h2>
          <p className="text-gray-500 mb-4">Tell us about yourself to get personalized recommendations and start your journey.</p>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelFromPoints(profile.total_points);
  const motivation = getDailyMotivation();
  const streakMessage = getStreakMessage(profile.current_streak);

  const weeklyMinutes = activities
    .filter((a) => isSameWeek(a.activity_date))
    .reduce((sum, a) => sum + a.duration_minutes, 0);

  const challengesCompleted = 0; // Would come from challenges hook

  const todayActivities = activities.filter(
    (a) => a.activity_date === new Date().toISOString().split('T')[0],
  );
  const todayPoints = todayActivities.reduce((sum, a) => sum + a.points, 0);

  const recentActivities = activities.slice(0, 5);

  // Generate quick recommendation
  const handleGetRecommendation = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      navigate('/recommendations');
    }, 500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {greeting}, {profile.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">{streakMessage}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Log Activity
        </button>
      </div>

      {/* Motivation Banner */}
      <div className="card p-5 bg-gradient-to-r from-primary-600 to-primary-700 border-0 animate-slide-up">
        <div className="flex items-center gap-3">
          <Quote className="w-8 h-8 text-primary-300 flex-shrink-0" />
          <p className="text-white text-lg font-medium italic">{motivation}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label="Today's FitPoints"
          value={todayPoints}
          subtitle={`Total: ${profile.total_points} pts`}
          color="accent"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${profile.current_streak} days`}
          subtitle={`Best: ${profile.longest_streak} days`}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="Weekly Activity"
          value={`${weeklyMinutes} min`}
          subtitle="This week"
          color="secondary"
        />
        <StatCard
          icon={Trophy}
          label="Challenges Done"
          value={challengesCompleted}
          subtitle="Completed"
          color="warning"
        />
      </div>

      {/* Level Progress */}
      <div className="card p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Level {levelInfo.level} — {levelInfo.name}</p>
              <p className="text-sm text-gray-500">
                {levelInfo.nextLevelPoints
                  ? `${levelInfo.nextLevelPoints - profile.total_points} pts to next level`
                  : 'Max level reached!'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">{levelInfo.progressPercent}%</p>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
      </div>

      {/* What Can I Do Today */}
      <div className="card p-6 bg-gradient-to-br from-secondary-50 to-primary-50 border-0 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">✨ What Can I Do Today?</h2>
            <p className="text-sm text-gray-600">Get a personalized activity plan based on your profile</p>
          </div>
        </div>
        <button
          onClick={handleGetRecommendation}
          disabled={generating}
          className="btn-primary flex items-center gap-2"
        >
          {generating ? (
            <>
              <LoadingSpinner size="sm" />
              Generating your plan...
            </>
          ) : (
            <>
              Get My Recommendation <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-2">
          {announcements.map((a) => (
            <div key={a.id} className="card p-4 flex items-start gap-3 animate-slide-up">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                <p className="text-xs text-gray-500">{a.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activities */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
          <button onClick={() => navigate('/activities')} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {activitiesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner label="Loading activities..." />
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {recentActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No activities yet</p>
            <p className="text-sm text-gray-400 mb-4">Log your first activity to start earning FitPoints!</p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Activity
            </button>
          </div>
        )}
      </div>

      {isDemoMode && (
        <div className="card p-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-700">
            Demo mode: Supabase is not configured. Authentication and data storage require Supabase setup.
          </p>
        </div>
      )}

      <AddActivityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={saveActivity}
      />
    </div>
  );
}
