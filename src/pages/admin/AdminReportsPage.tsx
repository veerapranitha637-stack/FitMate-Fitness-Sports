import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, Zap, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [activityTypeData, setActivityTypeData] = useState<{ name: string; value: number }[]>([]);
  const [dailyActivityData, setDailyActivityData] = useState<{ date: string; activities: number; points: number }[]>([]);
  const [ageGroupData, setAgeGroupData] = useState<{ name: string; value: number }[]>([]);
  const [totals, setTotals] = useState({ activities: 0, points: 0, users: 0 });

  useEffect(() => {
    (async () => {
      const { data: activities } = await supabase.from('activities').select('activity_type, points, activity_date');
      const { data: profiles } = await supabase.from('profiles').select('age_group, total_points').eq('role', 'user');

      // Activity type distribution
      const typeCounts: Record<string, number> = {};
      (activities ?? []).forEach((a) => {
        typeCounts[a.activity_type] = (typeCounts[a.activity_type] ?? 0) + 1;
      });
      setActivityTypeData(Object.entries(typeCounts).map(([name, value]) => ({ name, value })));

      // Daily activity (last 7 days)
      const days: { date: string; activities: number; points: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        const dayActs = (activities ?? []).filter((a) => a.activity_date === d);
        days.push({ date: d.slice(5), activities: dayActs.length, points: dayActs.reduce((s, a) => s + a.points, 0) });
      }
      setDailyActivityData(days);

      // Age group distribution
      const ageCounts: Record<string, number> = {};
      (profiles ?? []).forEach((p) => {
        const ag = p.age_group ?? 'Unknown';
        ageCounts[ag] = (ageCounts[ag] ?? 0) + 1;
      });
      setAgeGroupData(Object.entries(ageCounts).map(([name, value]) => ({ name, value })));

      setTotals({
        activities: activities?.length ?? 0,
        points: (activities ?? []).reduce((s, a) => s + a.points, 0),
        users: profiles?.length ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" label="Generating reports..." /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Platform-wide insights and trends</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <Activity className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <p className="text-xl font-bold text-gray-900">{totals.activities}</p>
          <p className="text-xs text-gray-500">Total Activities</p>
        </div>
        <div className="card p-4 text-center">
          <Zap className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-gray-900">{totals.points}</p>
          <p className="text-xs text-gray-500">Total Points</p>
        </div>
        <div className="card p-4 text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-gray-900">{totals.users}</p>
          <p className="text-xs text-gray-500">Total Users</p>
        </div>
      </div>

      {/* Daily activity chart */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Daily Activity (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dailyActivityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="activities" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Activities" />
            <Bar dataKey="points" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Points" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Activity type distribution */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Activity Type Distribution</h2>
          {activityTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={activityTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {activityTypeData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No activity data yet.</p>}
        </div>

        {/* Age group distribution */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Users by Age Group</h2>
          {ageGroupData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={ageGroupData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {ageGroupData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No user data yet.</p>}
        </div>
      </div>
    </div>
  );
}
