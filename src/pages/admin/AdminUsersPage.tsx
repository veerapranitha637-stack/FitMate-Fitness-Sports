import { useState, useEffect, useCallback } from 'react';
import { Users, Search, UserX, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';
import { formatDate } from '@/utils/helpers';
import type { Profile } from '@/types';

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'user').order('created_at', { ascending: false });
    setUsers((data ?? []) as Profile[]);
    setFiltered((data ?? []) as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(users.filter((u) => u.full_name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)));
  }, [search, users]);

  const toggleActive = async (user: Profile) => {
    const newActive = !user.is_active;
    await supabase.from('profiles').update({ is_active: newActive }).eq('id', user.id);
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: newActive } : u));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-500 mt-1">View and manage user accounts</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input className="input-field pl-10" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Age Group</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Goal</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Points</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Streak</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xs font-bold">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{u.full_name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.age_group}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.fitness_level}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.fitness_goal}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">{u.total_points}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{u.current_streak}d</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          u.is_active
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {u.is_active ? <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />Active</span> : <span className="flex items-center gap-1"><UserX className="w-3 h-3" />Inactive</span>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{search ? 'No users match your search.' : 'No users yet.'}</p>
        </div>
      )}
    </div>
  );
}
