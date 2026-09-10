import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Activity as ActivityIcon, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivities } from '@/hooks/useActivities';
import { ActivityCard } from '@/components/ActivityCard';
import { AddActivityModal } from '@/components/AddActivityModal';
import { LoadingSpinner, EmptyState } from '@/components/ui/Common';
import { formatDate } from '@/utils/helpers';

export function ActivitiesPage() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { activities, loading, saveActivity } = useActivities();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your profile first</h2>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary mt-2">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const filtered = activities.filter((a) => {
    const d = new Date(a.activity_date);
    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return d >= weekAgo;
    }
    if (filter === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const grouped = filtered.reduce((acc, a) => {
    if (!acc[a.activity_date]) acc[a.activity_date] = [];
    acc[a.activity_date].push(a);
    return acc;
  }, {} as Record<string, typeof activities>);

  const sortedDates = Object.keys(grouped).sort().reverse();
  const totalMinutes = filtered.reduce((s, a) => s + a.duration_minutes, 0);
  const totalPoints = filtered.reduce((s, a) => s + a.points, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Activities</h1>
          <p className="text-gray-500 mt-1">Track your fitness activities and earn FitPoints</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Activity
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          <p className="text-xs text-gray-500">Activities</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalMinutes}</p>
          <p className="text-xs text-gray-500">Total Minutes</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-accent-600">{totalPoints}</p>
          <p className="text-xs text-gray-500">FitPoints</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'week', 'month'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* Activities grouped by date */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner label="Loading activities..." />
        </div>
      ) : sortedDates.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">{formatDate(date)}</h3>
                <span className="text-xs text-gray-400">({grouped[date].length} activities)</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {grouped[date].map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ActivityIcon className="w-12 h-12" />}
          title="No activities yet"
          description="Start tracking your fitness activities to earn FitPoints and build streaks!"
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Your First Activity
            </button>
          }
        />
      )}

      <AddActivityModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={saveActivity}
      />
    </div>
  );
}
