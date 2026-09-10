import { Award, Flame, Trophy, Target, Gamepad2, Activity, Footprints } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Badge as BadgeType } from '@/types';

const iconMap: Record<string, LucideIcon> = {
  Footprints,
  Flame,
  Trophy,
  Target,
  Gamepad2,
  Activity,
  Award,
};

interface BadgeCardProps {
  badge: BadgeType;
  earned?: boolean;
  earnedAt?: string;
}

export function BadgeCard({ badge, earned = false, earnedAt }: BadgeCardProps) {
  const Icon = iconMap[badge.icon] ?? Award;

  return (
    <div
      className={`card p-4 text-center transition-all duration-300 ${
        earned
          ? 'border-primary-200 bg-gradient-to-b from-primary-50 to-white animate-bounce-once'
          : 'opacity-60 grayscale'
      }`}
    >
      <div
        className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-2 ${
          earned ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
        }`}
      >
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="font-semibold text-sm text-gray-800">{badge.name}</h4>
      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
      {earned && earnedAt && (
        <p className="text-xs text-primary-600 mt-2 font-medium">
          Earned {new Date(earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      )}
    </div>
  );
}
