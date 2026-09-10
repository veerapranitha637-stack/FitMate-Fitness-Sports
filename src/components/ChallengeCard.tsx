import { Trophy, Clock, Target, CheckCircle2, Plus } from 'lucide-react';
import type { ChallengeWithParticipation } from '@/hooks/useChallenges';

interface ChallengeCardProps {
  challenge: ChallengeWithParticipation;
  onJoin?: () => void;
  loading?: boolean;
}

export function ChallengeCard({ challenge, onJoin, loading }: ChallengeCardProps) {
  const isJoined = !!challenge.participation;
  const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.target_value) * 100));

  return (
    <div className="card p-5 card-hover animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-pill bg-primary-100 text-primary-700">
              {challenge.activity_type}
            </span>
            {challenge.completed && (
              <span className="badge-pill bg-green-100 text-green-700">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{challenge.name}</h3>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-accent-600">
            <Trophy className="w-4 h-4" />
            <span className="font-bold">{challenge.reward_points}</span>
          </div>
          <p className="text-xs text-gray-400">reward pts</p>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{challenge.description}</p>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1.5">
          <Target className="w-4 h-4 text-gray-400" />
          <span>{challenge.target_value} {challenge.challenge_type === 'group' ? 'total min' : 'min target'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{challenge.duration_days} days</span>
        </div>
      </div>

      {isJoined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">Progress</span>
            <span className="text-xs font-bold text-gray-700">
              {challenge.progress} / {challenge.target_value} min
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                challenge.completed ? 'bg-primary-500' : 'bg-gradient-to-r from-primary-400 to-primary-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {!isJoined && onJoin && (
        <button
          onClick={onJoin}
          disabled={loading}
          className="btn-primary w-full text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Join Challenge
            </>
          )}
        </button>
      )}

      {isJoined && !challenge.completed && (
        <div className="text-center text-sm text-primary-600 font-medium">
          {progressPercent >= 100 ? 'Challenge completed!' : `${progressPercent}% complete — keep going!`}
        </div>
      )}
    </div>
  );
}
