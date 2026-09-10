import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivities } from '@/hooks/useActivities';
import { RecommendationCard } from '@/components/RecommendationCard';
import { LoadingSpinner } from '@/components/ui/Common';
import { AddActivityModal } from '@/components/AddActivityModal';
import { generateAIRecommendation } from '@/services/recommendationEngine';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getTodayISODate } from '@/utils/helpers';
import type { Recommendation, ActivityType } from '@/types';

export function RecommendationsPage() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { activities, saveActivity } = useActivities();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalDefaults, setModalDefaults] = useState<{ type?: ActivityType; duration?: number }>({});
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const recentActivities = useMemo(() => activities.slice(0, 10), [activities]);

  const handleGenerate = async () => {
    if (!profile) return;
    setGenerating(true);
    setCompleted(false);
    setSuccessMessage('');
    const rec = await generateAIRecommendation(profile, recentActivities);
    setRecommendation(rec);

    // Save to recommendation history
    if (isSupabaseConfigured && profile) {
      await supabase.from('recommendation_history').insert({
        user_id: profile.id,
        activity_type: rec.activityType,
        duration_minutes: rec.totalMinutes,
        goal: profile.fitness_goal,
        completed: false,
      });
    }

    setGenerating(false);
  };

  const handleStart = () => {
    if (!recommendation) return;
    setModalDefaults({
      type: recommendation.activityType,
      duration: recommendation.totalMinutes,
    });
    setShowAddModal(true);
  };

  const handleMarkCompleted = async () => {
    if (!recommendation || !profile || completing) return;
    setCompleting(true);
    setSuccessMessage('');

    const result = await saveActivity({
      activity_type: recommendation.activityType,
      duration_minutes: recommendation.totalMinutes,
      activity_date: getTodayISODate(),
      notes: `Completed from AI recommendation: ${recommendation.title}`,
    });

    if (result.success) {
      setCompleted(true);
      setSuccessMessage(`Activity completed! You earned ${result.pointsEarned} FitPoints. Your streak and stats have been updated.`);

      // Mark recommendation as completed in history
      if (isSupabaseConfigured && profile) {
        await supabase
          .from('recommendation_history')
          .update({ completed: true })
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1);
      }
    } else {
      setSuccessMessage(`Error: ${result.error ?? 'Could not save activity'}`);
    }

    setCompleting(false);
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
          <Sparkles className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your fitness profile first</h2>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary mt-2">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Fitness Coach</h1>
          <p className="text-gray-500 mt-1">Personalized activity plans based on your profile and recent activities</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {generating ? (
            <>
              <LoadingSpinner size="sm" />
              Generating...
            </>
          ) : recommendation ? (
            <>
              <RefreshCw className="w-4 h-4" />
              New Recommendation
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              What Can I Do Today?
            </>
          )}
        </button>
      </div>

      {/* Profile Summary */}
      <div className="card p-4 animate-slide-up">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Fitness Profile</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-gray-400">Level</p>
            <p className="text-sm font-semibold text-gray-700">{profile.fitness_level}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Goal</p>
            <p className="text-sm font-semibold text-gray-700">{profile.fitness_goal}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Available Time</p>
            <p className="text-sm font-semibold text-gray-700">{profile.daily_available_time}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Activities</p>
            <p className="text-sm font-semibold text-gray-700">{profile.preferred_activities.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 animate-fade-in">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Recommendation */}
      {generating ? (
        <div className="card p-12 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" label="Analyzing your profile and generating a personalized plan..." />
        </div>
      ) : recommendation ? (
        <RecommendationCard
          recommendation={recommendation}
          onStart={handleStart}
          onMarkCompleted={handleMarkCompleted}
          loading={completing}
          completed={completed}
        />
      ) : (
        <div className="card p-12 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Get your personalized plan</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            We'll analyze your fitness level, goals, available time, and recent activities to create a tailored activity plan for today.
          </p>
          <button onClick={handleGenerate} className="btn-primary inline-flex items-center gap-2">
            <Play className="w-4 h-4" />
            What Can I Do Today?
          </button>
        </div>
      )}

      <AddActivityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={saveActivity}
        defaultType={modalDefaults.type}
        defaultDuration={modalDefaults.duration}
      />
    </div>
  );
}
