import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/Common';
import { useAuth } from '@/hooks/useAuth';
import { useChallenges } from '@/hooks/useChallenges';
import { ChallengeCard } from '@/components/ChallengeCard';

export function ChallengesPage() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { challenges, loading, joinChallenge } = useChallenges();
  const [joiningId, setJoiningId] = useState<string | null>(null);

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
          <Trophy className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your profile first</h2>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary mt-2">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  const handleJoin = async (challengeId: string) => {
    setJoiningId(challengeId);
    await joinChallenge(challengeId);
    setJoiningId(null);
  };

  const joinedCount = challenges.filter((c) => c.participation).length;
  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Challenges</h1>
        <p className="text-gray-500 mt-1">Join challenges, stay motivated, and earn reward points</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{challenges.length}</p>
          <p className="text-xs text-gray-500">Available Challenges</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{joinedCount}</p>
          <p className="text-xs text-gray-500">Joined</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner label="Loading challenges..." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onJoin={() => handleJoin(challenge.id)}
              loading={joiningId === challenge.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
