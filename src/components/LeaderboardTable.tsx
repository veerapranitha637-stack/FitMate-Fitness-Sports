import { Flame, Trophy, Zap } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const rankColors = ['text-amber-500', 'text-gray-400', 'text-orange-600'];

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span className="flex items-center justify-end gap-1"><Zap className="w-3 h-3" /> Points</span>
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span className="flex items-center justify-end gap-1"><Flame className="w-3 h-3" /> Streak</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => {
              const isCurrentUser = entry.isCurrentUser || (currentUserId && entry.id === currentUserId);
              return (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-50 transition-colors ${
                    isCurrentUser ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {idx < 3 ? (
                        <Trophy className={`w-5 h-5 ${rankColors[idx]}`} />
                      ) : (
                        <span className="text-sm font-bold text-gray-400 w-5 text-center">{idx + 1}</span>
                      )}
                      {idx < 3 && <span className="text-sm font-bold text-gray-700">{idx + 1}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrentUser ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'
                      }`}>
                        {entry.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isCurrentUser ? 'text-primary-700' : 'text-gray-800'}`}>
                          {entry.full_name}
                          {isCurrentUser && <span className="ml-2 text-xs text-primary-500">(You)</span>}
                        </p>
                        <p className="text-xs text-gray-400">{entry.age_group}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-gray-800">{entry.total_points}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="badge-pill bg-secondary-100 text-secondary-600">L{entry.level}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-gray-700 flex items-center justify-end gap-1">
                      <Flame className="w-3.5 h-3.5 text-accent-500" />
                      {entry.current_streak}d
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
