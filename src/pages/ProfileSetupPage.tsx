import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, ArrowRight, Check, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  FITNESS_LEVELS,
  FITNESS_GOALS,
  PREFERRED_ACTIVITIES,
  DAILY_AVAILABLE_TIMES,
  AGE_GROUPS,
} from '@/config/fitpoints';
import type { FitnessLevel, FitnessGoal, ActivityType, DailyAvailableTime, AgeGroup } from '@/types';
import { LoadingSpinner } from '@/components/ui/Common';

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('Adult');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('Beginner');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('Stay Active');
  const [preferredActivities, setPreferredActivities] = useState<ActivityType[]>(['Walking']);
  const [dailyTime, setDailyTime] = useState<DailyAvailableTime>('30 minutes');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (profile) {
      setFullName(profile.full_name);
      setAgeGroup(profile.age_group);
      setFitnessLevel(profile.fitness_level);
      setFitnessGoal(profile.fitness_goal);
      setPreferredActivities(profile.preferred_activities);
      setDailyTime(profile.daily_available_time);
    }
  }, [user, profile, loading, navigate]);

  const toggleActivity = (activity: ActivityType) => {
    setPreferredActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity],
    );
  };

  const handleSave = async () => {
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (preferredActivities.length === 0) {
      setError('Please select at least one preferred activity');
      return;
    }

    if (!user || !isSupabaseConfigured) {
      setError('Unable to save profile. Please try again.');
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        age_group: ageGroup,
        fitness_level: fitnessLevel,
        fitness_goal: fitnessGoal,
        preferred_activities: preferredActivities,
        daily_available_time: dailyTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" label="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        <div className="card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fitness Profile</h1>
              <p className="text-sm text-gray-500">Tell us about yourself to get personalized recommendations</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
              />
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AGE_GROUPS.map((group) => (
                  <button
                    key={group}
                    onClick={() => setAgeGroup(group)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      ageGroup === group
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Fitness Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
              <div className="grid grid-cols-3 gap-2">
                {FITNESS_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setFitnessLevel(level)}
                    className={`px-3 py-3 rounded-xl text-sm font-medium border transition-all ${
                      fitnessLevel === level
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Fitness Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goal</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FITNESS_GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setFitnessGoal(goal)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      fitnessGoal === goal
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Activities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Activities <span className="text-gray-400">(select multiple)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PREFERRED_ACTIVITIES.map((activity) => {
                  const selected = preferredActivities.includes(activity);
                  return (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        selected
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {selected && <Check className="w-4 h-4" />}
                      {activity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Available Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Available Time</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DAILY_AVAILABLE_TIMES.map((time) => (
                  <button
                    key={time}
                    onClick={() => setDailyTime(time)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      dailyTime === time
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Save & Continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
