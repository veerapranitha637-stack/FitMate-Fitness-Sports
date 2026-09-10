import { useState } from 'react';
import { X, Activity as ActivityIcon, Clock, MapPin, Calendar, Save } from 'lucide-react';
import {
  PREFERRED_ACTIVITIES,
  calculateActivityPoints,
} from '@/config/fitpoints';
import type { ActivityType } from '@/types';
import { getTodayISODate } from '@/utils/helpers';
import { LoadingSpinner } from '@/components/ui/Common';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: {
    activity_type: ActivityType;
    duration_minutes: number;
    distance?: number;
    activity_date: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string; pointsEarned?: number }>;
  defaultType?: ActivityType;
  defaultDuration?: number;
}

export function AddActivityModal({
  isOpen,
  onClose,
  onSave,
  defaultType = 'Walking',
  defaultDuration,
}: AddActivityModalProps) {
  const [activityType, setActivityType] = useState<ActivityType>(defaultType);
  const [duration, setDuration] = useState(defaultDuration?.toString() ?? '30');
  const [distance, setDistance] = useState('');
  const [date, setDate] = useState(getTodayISODate());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset when opened with new defaults
  const handleOpenChange = () => {
    setActivityType(defaultType);
    setDuration(defaultDuration?.toString() ?? '30');
  };

  if (!isOpen) return null;

  const estimatedPoints = calculateActivityPoints(activityType, parseInt(duration || '0', 10));

  const handleSave = async () => {
    setError('');
    setSuccess('');

    const dur = parseInt(duration, 10);
    if (!dur || dur <= 0) {
      setError('Please enter a valid duration');
      return;
    }

    if (dur > 600) {
      setError('Duration seems too high. Please check your input.');
      return;
    }

    setSaving(true);
    const result = await onSave({
      activity_type: activityType,
      duration_minutes: dur,
      distance: distance ? parseFloat(distance) : undefined,
      activity_date: date,
      notes: notes.trim() || undefined,
    });

    setSaving(false);

    if (result.success) {
      setSuccess(`Activity saved! You earned ${result.pointsEarned} FitPoints!`);
      setTimeout(() => {
        onClose();
        setSuccess('');
        setNotes('');
        setDistance('');
        handleOpenChange();
      }, 1500);
    } else {
      setError(result.error ?? 'Failed to save activity');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">Add Activity</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="rounded-xl bg-primary-50 border border-primary-200 p-3 text-sm text-primary-700 flex items-center gap-2">
              <span className="text-lg">🎉</span> {success}
            </div>
          )}

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
            <div className="grid grid-cols-3 gap-2">
              {PREFERRED_ACTIVITIES.map((type) => (
                <button
                  key={type}
                  onClick={() => setActivityType(type)}
                  className={`px-2 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                    activityType === type
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1.5">
              Duration (minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                min="1"
                max="600"
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={getTodayISODate()}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Distance (optional) */}
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1.5">
              Distance (km) <span className="text-gray-400">optional</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="distance"
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="0"
                step="0.1"
                min="0"
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Notes (optional) */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes <span className="text-gray-400">optional</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go?"
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {/* Points preview */}
          <div className="flex items-center justify-between bg-accent-50 rounded-xl p-3">
            <span className="text-sm font-medium text-accent-700">Estimated FitPoints</span>
            <span className="text-lg font-bold text-accent-600">+{estimatedPoints} pts</span>
          </div>

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Activity
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
