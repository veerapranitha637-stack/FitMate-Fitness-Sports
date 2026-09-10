import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Challenge, ChallengeParticipant } from '@/types';

export interface ChallengeWithParticipation extends Challenge {
  participation?: ChallengeParticipant;
  progress: number;
  completed: boolean;
}

export function useChallenges() {
  const { user, refreshProfile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [participations, setParticipations] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from('challenges').select('*').order('created_at', { ascending: true });
    if (data) setChallenges(data as Challenge[]);

    if (user) {
      const { data: pData } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('user_id', user.id);
      if (pData) setParticipations(pData as ChallengeParticipant[]);
    }
    setLoading(false);
  }, [user, isSupabaseConfigured]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const joinChallenge = async (challengeId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !isSupabaseConfigured) {
      return { success: false, error: 'Please sign in to join challenges' };
    }

    const existing = participations.find((p) => p.challenge_id === challengeId);
    if (existing) return { success: false, error: 'Already joined this challenge' };

    const { error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: user.id,
        progress: 0,
        completed: false,
      });

    if (error) return { success: false, error: error.message };

    await fetchChallenges();
    return { success: true };
  };

  const updateChallengeProgress = async (
    challengeId: string,
    progress: number,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !isSupabaseConfigured) return { success: false, error: 'Not available' };

    const participation = participations.find((p) => p.challenge_id === challengeId);
    if (!participation) return { success: false, error: 'Not joined' };

    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return { success: false, error: 'Challenge not found' };

    const newProgress = Math.max(participation.progress, progress);
    const completed = newProgress >= challenge.target_value;

    const { error } = await supabase
      .from('challenge_participants')
      .update({ progress: newProgress, completed })
      .eq('id', participation.id);

    if (error) return { success: false, error: error.message };

    // If challenge completed, award points
    if (completed && !participation.completed) {
      await supabase
        .from('profiles')
        .update({
          total_points: (await supabase.from('profiles').select('total_points').eq('id', user.id).maybeSingle()).data?.total_points + challenge.reward_points,
        })
        .eq('id', user.id);
      await refreshProfile();
    }

    await fetchChallenges();
    return { success: true };
  };

  const challengesWithParticipation: ChallengeWithParticipation[] = challenges.map((c) => {
    const participation = participations.find((p) => p.challenge_id === c.id);
    return {
      ...c,
      participation,
      progress: participation?.progress ?? 0,
      completed: participation?.completed ?? false,
    };
  });

  return {
    challenges: challengesWithParticipation,
    loading,
    joinChallenge,
    updateChallengeProgress,
    fetchChallenges,
  };
}
