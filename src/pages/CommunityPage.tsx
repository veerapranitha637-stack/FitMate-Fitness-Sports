import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  UserPlus,
  X,
  ArrowLeft,
  Trophy,
  Zap,
  Clock,
  Target,
  TrendingUp,
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';
import { GROUP_TYPES } from '@/config/fitpoints';
import { formatDate } from '@/utils/helpers';
import type { Group, GroupMember, GroupType, Profile, GroupChallenge } from '@/types';

interface GroupWithCount extends Group {
  member_count: number;
}

interface MemberStats {
  userId: string;
  name: string;
  totalPoints: number;
  totalMinutes: number;
}

export function CommunityPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  const [groups, setGroups] = useState<GroupWithCount[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Create form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState<GroupType>('Family');

  // Group detail view state
  const [selectedGroup, setSelectedGroup] = useState<GroupWithCount | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, Profile>>({});
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);
  const [groupChallenges, setGroupChallenges] = useState<GroupChallenge[]>([]);
  const [groupTotalPoints, setGroupTotalPoints] = useState(0);
  const [groupTotalMinutes, setGroupTotalMinutes] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [challengeName, setChallengeName] = useState('');
  const [challengeDesc, setChallengeDesc] = useState('');
  const [challengeTarget, setChallengeTarget] = useState('300');
  const [challengeReward, setChallengeReward] = useState('100');
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [challengeError, setChallengeError] = useState('');

  const fetchGroups = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: groupsData } = await supabase.from('groups').select('*').order('created_at', { ascending: false });

    if (groupsData) {
      const groupsWithCount = await Promise.all(
        (groupsData as Group[]).map(async (g) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', g.id);
          return { ...g, member_count: count ?? 0 };
        }),
      );
      setGroups(groupsWithCount);

      const { data: myMemberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);
      setJoinedGroups((myMemberships ?? []).map((m) => (m as { group_id: string }).group_id));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const fetchGroupDetail = useCallback(async (groupId: string) => {
    if (!isSupabaseConfigured) return;
    setDetailLoading(true);

    // Get members
    const { data: membersData } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    const members = (membersData ?? []) as GroupMember[];
    setGroupMembers(members);

    // Get profiles for all members
    const userIds = members.map((m) => m.user_id);
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      const profilesMap: Record<string, Profile> = {};
      (profilesData ?? []).forEach((p) => {
        profilesMap[(p as Profile).id] = p as Profile;
      });
      setMemberProfiles(profilesMap);

      // Calculate member stats (points + minutes from activities)
      const stats: MemberStats[] = [];
      let totalPts = 0;
      let totalMins = 0;

      for (const member of members) {
        const mp = profilesMap[member.user_id];
        const memberName = mp?.full_name ?? 'Unknown';

        // Get total activity minutes for this member
        const { data: memberActivities } = await supabase
          .from('activities')
          .select('duration_minutes, points')
          .eq('user_id', member.user_id);

        const minutes = (memberActivities ?? []).reduce((s, a) => s + a.duration_minutes, 0);
        const points = (memberActivities ?? []).reduce((s, a) => s + a.points, 0);

        stats.push({ userId: member.user_id, name: memberName, totalPoints: points, totalMinutes: minutes });
        totalPts += points;
        totalMins += minutes;
      }

      // Sort by points descending for leaderboard
      stats.sort((a, b) => b.totalPoints - a.totalPoints);
      setMemberStats(stats);
      setGroupTotalPoints(totalPts);
      setGroupTotalMinutes(totalMins);
    } else {
      setMemberProfiles({});
      setMemberStats([]);
      setGroupTotalPoints(0);
      setGroupTotalMinutes(0);
    }

    // Get group challenges
    const { data: challengesData } = await supabase
      .from('group_challenges')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    setGroupChallenges((challengesData ?? []) as GroupChallenge[]);

    setDetailLoading(false);
  }, []);

  const handleCreate = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }
    if (!user || !isSupabaseConfigured) {
      setError('Unable to create group');
      return;
    }

    setCreating(true);
    const { data: newGroup, error: createError } = await supabase
      .from('groups')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        group_type: groupType,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      setError(createError.message);
      setCreating(false);
      return;
    }

    // Join the group automatically as creator
    await supabase.from('group_members').insert({
      group_id: (newGroup as Group).id,
      user_id: user.id,
    });

    setCreating(false);
    setShowCreate(false);
    setName('');
    setDescription('');
    await fetchGroups();
  };

  const handleJoin = async (groupId: string) => {
    if (!user || !isSupabaseConfigured) return;
    await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: user.id,
    });
    await fetchGroups();
  };

  const handleLeave = async (groupId: string) => {
    if (!user || !isSupabaseConfigured) return;
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id);
    await fetchGroups();
  };

  const handleOpenGroup = (group: GroupWithCount) => {
    setSelectedGroup(group);
    fetchGroupDetail(group.id);
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
    setGroupMembers([]);
    setMemberStats([]);
    setGroupChallenges([]);
    fetchGroups();
  };

  const handleCreateChallenge = async () => {
    setChallengeError('');
    if (!challengeName.trim()) {
      setChallengeError('Please enter a challenge name');
      return;
    }
    const target = parseInt(challengeTarget, 10);
    if (!target || target <= 0) {
      setChallengeError('Please enter a valid target (minutes)');
      return;
    }
    if (!user || !isSupabaseConfigured || !selectedGroup) {
      setChallengeError('Unable to create challenge');
      return;
    }

    setCreatingChallenge(true);
    const { error: createErr } = await supabase
      .from('group_challenges')
      .insert({
        group_id: selectedGroup.id,
        name: challengeName.trim(),
        description: challengeDesc.trim() || 'Complete the target minutes together!',
        target_value: target,
        reward_points: parseInt(challengeReward, 10) || 100,
        progress: 0,
        completed: false,
        created_by: user.id,
      });

    if (createErr) {
      setChallengeError(createErr.message);
      setCreatingChallenge(false);
      return;
    }

    setCreatingChallenge(false);
    setShowCreateChallenge(false);
    setChallengeName('');
    setChallengeDesc('');
    setChallengeTarget('300');
    setChallengeReward('100');
    await fetchGroupDetail(selectedGroup.id);
  };

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
          <Users className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your profile first</h2>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary mt-2">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  // ===== GROUP DETAIL VIEW =====
  if (selectedGroup) {
    const isJoined = joinedGroups.includes(selectedGroup.id);
    const activeMembers = memberStats.length;
    const motivationalMessages: string[] = [];

    groupChallenges.forEach((gc) => {
      if (!gc.completed && gc.target_value > 0) {
        const pct = Math.min(100, Math.round((gc.progress / gc.target_value) * 100));
        if (pct >= 75) {
          motivationalMessages.push(`Your ${selectedGroup.name} is ${pct}% toward the goal — almost there!`);
        } else if (pct >= 50) {
          motivationalMessages.push(`Your ${selectedGroup.name} is ${pct}% toward the goal — keep pushing!`);
        } else if (pct >= 25) {
          motivationalMessages.push(`Your ${selectedGroup.name} is ${pct}% toward the goal — great start!`);
        } else {
          motivationalMessages.push(`Your ${selectedGroup.name} is ${pct}% toward the goal — every minute counts!`);
        }
      }
    });

    if (motivationalMessages.length === 0 && groupChallenges.length > 0) {
      motivationalMessages.push('All group challenges completed — amazing teamwork!');
    }

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to groups
        </button>

        {/* Group header */}
        <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-700 border-0 animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <span className="badge-pill bg-white/20 text-white mb-2">{selectedGroup.group_type}</span>
              <h1 className="text-2xl font-bold text-white">{selectedGroup.name}</h1>
              {selectedGroup.description && (
                <p className="text-primary-100 text-sm mt-1">{selectedGroup.description}</p>
              )}
            </div>
            {isJoined && (
              <button
                onClick={() => { handleLeave(selectedGroup.id); handleBackToList(); }}
                className="text-sm font-semibold px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"
              >
                Leave Group
              </button>
            )}
          </div>
        </div>

        {/* Motivational messages */}
        {motivationalMessages.length > 0 && (
          <div className="space-y-2">
            {motivationalMessages.map((msg, idx) => (
              <div key={idx} className="card p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="w-9 h-9 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-gray-700">{msg}</p>
              </div>
            ))}
          </div>
        )}

        {/* Group statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 text-center animate-slide-up">
            <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{groupTotalPoints}</p>
            <p className="text-xs text-gray-500">Total FitPoints</p>
          </div>
          <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{groupTotalMinutes}</p>
            <p className="text-xs text-gray-500">Activity Minutes</p>
          </div>
          <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeMembers}</p>
            <p className="text-xs text-gray-500">Active Members</p>
          </div>
          <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{groupChallenges.filter((c) => c.completed).length}</p>
            <p className="text-xs text-gray-500">Challenges Done</p>
          </div>
        </div>

        {/* Group challenges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Group Challenges</h2>
            {isJoined && (
              <button
                onClick={() => setShowCreateChallenge(true)}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Challenge
              </button>
            )}
          </div>

          {detailLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner label="Loading challenges..." />
            </div>
          ) : groupChallenges.length > 0 ? (
            <div className="space-y-3">
              {groupChallenges.map((gc) => {
                const pct = Math.min(100, Math.round((gc.progress / gc.target_value) * 100));
                return (
                  <div key={gc.id} className="card p-5 animate-slide-up">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-primary-600" />
                          <h3 className="font-bold text-gray-900">{gc.name}</h3>
                          {gc.completed && (
                            <span className="badge-pill bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{gc.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-accent-600">
                          <Award className="w-4 h-4" />
                          <span className="font-bold">{gc.reward_points}</span>
                        </div>
                        <p className="text-xs text-gray-400">reward each</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">{gc.progress} / {gc.target_value} min</span>
                      <span className="font-bold text-primary-600">{pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          gc.completed
                            ? 'bg-green-500'
                            : 'bg-gradient-to-r from-primary-400 to-primary-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Created {formatDate(gc.created_at)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No group challenges yet</p>
              <p className="text-sm text-gray-400 mb-4">Create a challenge and work toward it together!</p>
              {isJoined && (
                <button
                  onClick={() => setShowCreateChallenge(true)}
                  className="btn-primary text-sm inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Challenge
                </button>
              )}
            </div>
          )}
        </div>

        {/* Group leaderboard */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Group Leaderboard</h2>
          {detailLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner label="Loading leaderboard..." />
            </div>
          ) : memberStats.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rank</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Member</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        <span className="flex items-center justify-end gap-1"><Zap className="w-3 h-3" /> Points</span>
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        <span className="flex items-center justify-end gap-1"><Clock className="w-3 h-3" /> Minutes</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberStats.map((ms, idx) => {
                      const isCurrentUser = user?.id === ms.userId;
                      const rankColors = ['text-amber-500', 'text-gray-400', 'text-orange-600'];
                      return (
                        <tr
                          key={ms.userId}
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
                                {ms.name.charAt(0).toUpperCase()}
                              </div>
                              <span className={`text-sm font-medium ${isCurrentUser ? 'text-primary-700' : 'text-gray-800'}`}>
                                {ms.name}
                                {isCurrentUser && <span className="ml-2 text-xs text-primary-500">(You)</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-bold text-gray-800">{ms.totalPoints}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-gray-700">{ms.totalMinutes}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No members yet.</p>
            </div>
          )}
        </div>

        {/* Members list */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Members</h2>
          <div className="card p-5">
            {groupMembers.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {groupMembers.map((m) => {
                  const mp = memberProfiles[m.user_id];
                  const isCreator = selectedGroup.created_by === m.user_id;
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-bold text-sm">
                        {(mp?.full_name ?? 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {mp?.full_name ?? 'Unknown'}
                          {isCreator && <span className="ml-2 text-xs text-primary-500">Creator</span>}
                        </p>
                        <p className="text-xs text-gray-400">Joined {formatDate(m.joined_at)}</p>
                      </div>
                      {mp && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-accent-600">{mp.total_points}</p>
                          <p className="text-xs text-gray-400">points</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No members in this group yet.</p>
            )}
          </div>
        </div>

        {/* Create challenge modal */}
        {showCreateChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowCreateChallenge(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Add Group Challenge</h2>
                <button onClick={() => setShowCreateChallenge(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {challengeError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{challengeError}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Challenge Name</label>
                  <input
                    type="text"
                    value={challengeName}
                    onChange={(e) => setChallengeName(e.target.value)}
                    placeholder="e.g., Family 300-Minute Challenge"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={challengeDesc}
                    onChange={(e) => setChallengeDesc(e.target.value)}
                    placeholder="Work together to reach the goal!"
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Target (minutes)</label>
                    <input
                      type="number"
                      value={challengeTarget}
                      onChange={(e) => setChallengeTarget(e.target.value)}
                      placeholder="300"
                      min="1"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Reward (pts each)</label>
                    <input
                      type="number"
                      value={challengeReward}
                      onChange={(e) => setChallengeReward(e.target.value)}
                      placeholder="100"
                      min="1"
                      className="input-field"
                    />
                  </div>
                </div>
                <button onClick={handleCreateChallenge} disabled={creatingChallenge} className="btn-primary w-full">
                  {creatingChallenge ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" /> Creating...
                    </span>
                  ) : 'Create Challenge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== GROUP LIST VIEW =====
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-500 mt-1">Create or join groups to stay active together</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner label="Loading groups..." />
        </div>
      ) : groups.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((group) => {
            const isJoined = joinedGroups.includes(group.id);
            return (
              <div key={group.id} className="card p-5 card-hover animate-slide-up">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="badge-pill bg-primary-100 text-primary-700 mb-2">{group.group_type}</span>
                    <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{group.member_count}</p>
                    <p className="text-xs text-gray-400">members</p>
                  </div>
                </div>

                {group.description && <p className="text-sm text-gray-500 mb-3">{group.description}</p>}
                <p className="text-xs text-gray-400 mb-3">Created {formatDate(group.created_at)}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenGroup(group)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    View Details
                  </button>
                  {isJoined ? (
                    <button
                      onClick={() => handleLeave(group.id)}
                      className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(group.id)}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Join
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No groups yet</p>
          <p className="text-sm text-gray-400 mb-4">Create the first community group!</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create Group</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Group Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning Walkers Club"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this group about?"
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {GROUP_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setGroupType(type)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        groupType === type
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleCreate} disabled={creating} className="btn-primary w-full">
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" /> Creating...
                  </span>
                ) : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
