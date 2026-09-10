import { Clock, Zap, ChevronRight, Play, Flame, Wind, Activity, Check, Apple } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Recommendation } from '@/types';

const iconMap: Record<string, LucideIcon> = {
  Flame,
  Wind,
  Activity,
  Play,
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  onStart?: () => void;
  onMarkCompleted?: () => void;
  loading?: boolean;
  completed?: boolean;
}

export function RecommendationCard({ recommendation, onStart, onMarkCompleted, loading, completed }: RecommendationCardProps) {
  const difficultyColors = {
    Beginner: 'bg-primary-100 text-primary-700',
    Intermediate: 'bg-secondary-100 text-secondary-700',
    Advanced: 'bg-accent-100 text-accent-700',
  };

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{recommendation.title}</h3>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`badge-pill ${difficultyColors[recommendation.difficulty]}`}>
              {recommendation.difficulty}
            </span>
            <span className="badge-pill bg-gray-100 text-gray-600">
              <Activity className="w-3 h-3" />
              {recommendation.activityType}
            </span>
            <span className="badge-pill bg-secondary-100 text-secondary-700">
              <Clock className="w-3 h-3" />
              {recommendation.durationLabel}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-accent-600">
            <Zap className="w-5 h-5" />
            <span className="text-2xl font-bold">{recommendation.pointsEstimate}</span>
          </div>
          <p className="text-xs text-gray-400">est. points</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {recommendation.phases.map((phase, idx) => {
          const Icon = iconMap[phase.icon] ?? Activity;
          return (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-800">{phase.title}</h4>
                  <span className="text-xs font-medium text-gray-500">{phase.duration} min</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {recommendation.nutritionTip && (
        <div className="bg-green-50 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Apple className="w-3.5 h-3.5 text-green-600" />
            <p className="text-xs text-green-700 font-medium">Nutrition Tip</p>
          </div>
          <p className="text-xs text-green-600">{recommendation.nutritionTip}</p>
        </div>
      )}

      <div className="bg-blue-50 rounded-xl p-3 mb-4">
        <p className="text-xs text-blue-700 font-medium mb-1">Tips</p>
        <ul className="space-y-1">
          {recommendation.tips.map((tip, idx) => (
            <li key={idx} className="text-xs text-blue-600 flex items-start gap-1.5">
              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {recommendation.disclaimer && (
        <p className="text-xs text-gray-400 mb-4 italic">
          This is general fitness guidance, not medical advice. Consult a healthcare professional for specific concerns.
        </p>
      )}

      <div className="flex gap-3">
        {onStart && (
          <button
            onClick={onStart}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Add to My Plan
              </>
            )}
          </button>
        )}
        {onMarkCompleted && (
          <button
            onClick={onMarkCompleted}
            disabled={loading || completed}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all ${
              completed
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Check className="w-4 h-4" />
            {completed ? 'Completed!' : 'Mark as Completed'}
          </button>
        )}
      </div>
    </div>
  );
}
