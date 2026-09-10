import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { calculateActivityPoints } from '@/config/fitpoints';
import { getTodayISODate } from '@/utils/helpers';
import type { Activity, ActivityType } from '@/types';

interface SaveActivityInput {
  activity_type: ActivityType;
  duration_minutes: number;
  distance?: number;
  activity_date: string;
  notes?: string;
}

interface SaveActivityResult {
  success: boolean;
  error?: string;
  activity?: Activity;
  pointsEarned?: number;
}

export function useActivities() {
  const { user, refreshProfile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActivities(data as Activity[]);
    }
    setLoading(false);
  }, [user, isSupabaseConfigured]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const saveActivity = async (input: SaveActivityInput): Promise<SaveActivityResult> => {
    if (!user || !isSupabaseConfigured) {
      return { success: false, error: 'Not available in demo mode' };
    }

    const points = calculateActivityPoints(input.activity_type, input.duration_minutes);

    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        activity_type: input.activity_type,
        duration_minutes: input.duration_minutes,
        distance: input.distance ?? null,
        activity_date: input.activity_date,
        points,
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Update profile points and streak
    await updateProfileStats();
    // Auto-update challenge progress for matching challenges
    await updateChallengeProgressForActivity(input.activity_type, input.duration_minutes);
    // Auto-update group challenge progress
    await updateGroupChallengeProgress(input.duration_minutes);
    // Auto-unlock badges
    await checkAndUnlockBadges();
    await fetchActivities();

    return { success: true, activity: data as Activity, pointsEarned: points };
  };

  const updateProfileStats = async () => {
    if (!user || !isSupabaseConfigured) return;

    // Get all activities to calculate streak
    const { data: allActivities } = await supabase
      .from('activities')
      .select('activity_date')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false });

    if (!allActivities) return;

    // Calculate streak
    const uniqueDates = [...new Set(allActivities.map((a) => a.activity_date))].sort().reverse();
    const today = getTodayISODate();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    if (uniqueDates.includes(today)) {
      currentStreak = 1;
      let checkDate = yesterday;
      for (let i = 1; i < uniqueDates.length; i++) {
        if (uniqueDates[i] === checkDate) {
          currentStreak++;
          checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
        } else {
          break;
        }
      }
    } else if (uniqueDates.includes(yesterday)) {
      // Allow streak to continue from yesterday if today hasn't been logged yet
      currentStreak = 1;
      let checkDate = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
      for (let i = 1; i < uniqueDates.length; i++) {
        if (uniqueDates[i] === checkDate) {
          currentStreak++;
          checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
        } else {
          break;
        }
      }
    }

    // Calculate total points
    const { data: pointData } = await supabase
      .from('activities')
      .select('points')
      .eq('user_id', user.id);

    const totalPoints = pointData?.reduce((sum, a) => sum + a.points, 0) ?? 0;

    // Get current longest streak
    const { data: profileData } = await supabase
      .from('profiles')
      .select('longest_streak')
      .eq('id', user.id)
      .maybeSingle();

    const longestStreak = Math.max(profileData?.longest_streak ?? 0, currentStreak);

    // Determine level from points
    let level = 1;
    if (totalPoints >= 2000) level = 5;
    else if (totalPoints >= 1000) level = 4;
    else if (totalPoints >= 500) level = 3;
    else if (totalPoints >= 100) level = 2;

    await supabase
      .from('profiles')
      .update({
        total_points: totalPoints,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    await refreshProfile();
  };

  const updateChallengeProgressForActivity = async (activityType: string, durationMinutes: number) => {
    if (!user || !isSupabaseConfigured) return;

    // Get all challenges the user has joined
    const { data: participations } = await supabase
      .from('challenge_participants')
      .select('id, challenge_id, progress, completed')
      .eq('user_id', user.id);

    if (!participations || participations.length === 0) return;

    for (const p of participations) {
      if (p.completed) continue;

      const { data: challenge } = await supabase
        .from('challenges')
        .select('activity_type, target_value, reward_points')
        .eq('id', p.challenge_id)
        .maybeSingle();

      if (!challenge) continue;

      // Only update progress if the activity type matches
      if (challenge.activity_type !== activityType && challenge.activity_type !== 'Other') continue;

      const newProgress = p.progress + durationMinutes;
      const completed = newProgress >= challenge.target_value;

      await supabase
        .from('challenge_participants')
        .update({ progress: newProgress, completed })
        .eq('id', p.id);

      // Award reward points if just completed
      if (completed) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('total_points')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          await supabase
            .from('profiles')
            .update({ total_points: profileData.total_points + challenge.reward_points })
            .eq('id', user.id);
        }
      }
    }
  };

  const updateGroupChallengeProgress = async (durationMinutes: number) => {
    if (!user || !isSupabaseConfigured) return;

    // Get all groups the user belongs to
    const { data: myGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    if (!myGroups || myGroups.length === 0) return;

    const groupIds = myGroups.map((m) => m.group_id);

    // Get all active (not completed) group challenges for those groups
    const { data: activeChallenges } = await supabase
      .from('group_challenges')
      .select('id, group_id, progress, target_value, reward_points, completed')
      .in('group_id', groupIds)
      .eq('completed', false);

    if (!activeChallenges || activeChallenges.length === 0) return;

    for (const gc of activeChallenges) {
      const newProgress = gc.progress + durationMinutes;
      const completed = newProgress >= gc.target_value;

      await supabase
        .from('group_challenges')
        .update({ progress: newProgress, completed })
        .eq('id', gc.id);

      // If just completed, award reward points to all group members
      if (completed) {
        const { data: members } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', gc.group_id);

        for (const member of (members ?? [])) {
          const { data: memberProfile } = await supabase
            .from('profiles')
            .select('total_points')
            .eq('id', member.user_id)
            .maybeSingle();

          if (memberProfile) {
            await supabase
              .from('profiles')
              .update({ total_points: memberProfile.total_points + gc.reward_points })
              .eq('id', member.user_id);
          }
        }
      }
    }
  };

  const checkAndUnlockBadges = async () => {
    if (!user || !isSupabaseConfigured) return;

    // Get current profile stats
    const { data: profileData } = await supabase
      .from('profiles')
      .select('total_points, current_streak')
      .eq('id', user.id)
      .maybeSingle();

    if (!profileData) return;

    // Get all badges
    const { data: allBadges } = await supabase.from('badges').select('id, requirement');

    // Get already earned badges
    const { data: earnedBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', user.id);

    const earnedBadgeIds = new Set((earnedBadges ?? []).map((b) => b.badge_id));
    const allBadgesList = allBadges ?? [];

    // Get activity count
    const { count: activityCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get event registrations
    const { count: eventCount } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get completed challenges
    const { count: completedChallenges } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    const newBadges: { user_id: string; badge_id: string }[] = [];

    for (const badge of allBadgesList) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldUnlock = false;
      switch (badge.requirement) {
        case 'first_activity':
          shouldUnlock = (activityCount ?? 0) >= 1;
          break;
        case 'streak_3':
          shouldUnlock = profileData.current_streak >= 3;
          break;
        case 'streak_7':
          shouldUnlock = profileData.current_streak >= 7;
          break;
        case 'points_100':
          shouldUnlock = profileData.total_points >= 100;
          break;
        case 'points_500':
          shouldUnlock = profileData.total_points >= 500;
          break;
        case 'challenge_completed':
          shouldUnlock = (completedChallenges ?? 0) >= 1;
          break;
        case 'sports_participant':
          shouldUnlock = (eventCount ?? 0) >= 1;
          break;
        case 'goal_completed':
          shouldUnlock = (completedChallenges ?? 0) >= 1;
          break;
      }

      if (shouldUnlock) {
        newBadges.push({ user_id: user.id, badge_id: badge.id });
      }
    }

    if (newBadges.length > 0) {
      await supabase.from('user_badges').insert(newBadges);
    }
  };

  return { activities, loading, saveActivity, fetchActivities, updateProfileStats };
}
