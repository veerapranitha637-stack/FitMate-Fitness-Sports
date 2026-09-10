import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import { BarChart3, Activity as ActivityIcon, Zap, Flame, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivities } from '@/hooks/useActivities';
import { LoadingSpinner } from '@/components/ui/Common';
import { ProgressChart } from '@/components/ProgressChart';
import { getDayName, isSameWeek, isThisMonth } from '@/utils/helpers';
import type { Activity } from '@/types';

const COLORS = ['#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f59e0b', '#ec4899', '#6366f1'];

export function ProgressPage() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { activities, loading: activitiesLoading } = useActivities();
  const [filter, setFilter] = useState<'week' | 'month' | 'all'>('week');

  if (authLoading || activitiesLoading) {
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
          <BarChart3 className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your profile first</h2>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary mt-2">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  const filteredActivities: Activity[] = activities.filter((a) => {
    if (filter === 'week') return isSameWeek(a.activity_date);
    if (filter === 'month') return isThisMonth(a.activity_date);
    return true;
  });

  // Summary
  const totalActivities = filteredActivities.length;
  const totalMinutes = filteredActivities.reduce((s, a) => s + a.duration_minutes, 0);
  const totalPoints = filteredActivities.reduce((s, a) => s + a.points, 0);

  // Weekly chart data (last 7 days)
  const weeklyData = useMemo(() => {
    const days: { day: string; minutes: number; points: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayActivities = activities.filter((a) => a.activity_date === dateStr);
      days.push({
        day: getDayName(d),
        minutes: dayActivities.reduce((s, a) => s + a.duration_minutes, 0),
        points: dayActivities.reduce((s, a) => s + a.points, 0),
      });
    }
    return days;
  }, [activities]);

  // Activities by type (pie chart)
  const typeData = useMemo(() => {
    const typeMap: Record<string, number> = {};
    filteredActivities.forEach((a) => {
      typeMap[a.activity_type] = (typeMap[a.activity_type] ?? 0) + a.duration_minutes;
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  }, [filteredActivities]);

  // FitPoints over time (cumulative)
  const pointsData = useMemo(() => {
    const sorted = [...filteredActivities].sort((a, b) => a.activity_date.localeCompare(b.activity_date));
    let cumulative = 0;
    const seen: Record<string, number> = {};
    sorted.forEach((a) => {
      if (!seen[a.activity_date]) seen[a.activity_date] = 0;
      seen[a.activity_date] += a.points;
    });
    return Object.entries(seen)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, points]) => {
        cumulative += points;
        return { date: getDayName(date), points: cumulative };
      });
  }, [filteredActivities]);

  // Challenge completion (radial)
  const challengeData = [
    { name: 'Completed', value: 3, fill: '#10b981' },
    { name: 'In Progress', value: 2, fill: '#3b82f6' },
    { name: 'Available', value: 5, fill: '#e5e7eb' },
  ];

  const filters = [
    { key: 'week' as const, label: 'This Week' },
    { key: 'month' as const, label: 'This Month' },
    { key: 'all' as const, label: 'All Time' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Progress Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your fitness journey with detailed analytics</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center animate-slide-up">
          <ActivityIcon className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
          <p className="text-xs text-gray-500">Total Activities</p>
        </div>
        <div className="card p-4 text-center animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <Clock className="w-6 h-6 text-secondary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalMinutes}</p>
          <p className="text-xs text-gray-500">Total Minutes</p>
        </div>
        <div className="card p-4 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Zap className="w-6 h-6 text-accent-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
          <p className="text-xs text-gray-500">FitPoints</p>
        </div>
        <div className="card p-4 text-center animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{profile.current_streak}</p>
          <p className="text-xs text-gray-500">Current Streak</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Weekly Activity Minutes */}
        <ProgressChart title="Weekly Activity Minutes">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                cursor={{ fill: '#f0fdf4' }}
              />
              <Bar dataKey="minutes" fill="#10b981" radius={[8, 8, 0, 0]} name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </ProgressChart>

        {/* Activities by Type */}
        <ProgressChart title="Activities by Type">
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {typeData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              No activity data for this period
            </div>
          )}
        </ProgressChart>

        {/* FitPoints Over Time */}
        <ProgressChart title="FitPoints Earned Over Time">
          {pointsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={pointsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Cumulative Points"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              No points data for this period
            </div>
          )}
        </ProgressChart>

        {/* Challenge Completion */}
        <ProgressChart title="Challenge Completion">
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={challengeData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={10} background />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </ProgressChart>
      </div>
    </div>
  );
}
