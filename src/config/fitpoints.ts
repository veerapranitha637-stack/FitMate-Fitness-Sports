import type { ActivityType } from '@/types';

// FitPoints awarded per minute for each activity type
export const FIT_POINTS_PER_MINUTE: Record<ActivityType, number> = {
  Walking: 1,
  Running: 2,
  Cycling: 2,
  Yoga: 1,
  Gym: 2,
  Badminton: 2,
  Football: 2,
  Cricket: 2,
  Swimming: 2,
  Other: 1,
};

// Level thresholds — cumulative points needed to reach each level
export const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Beginner', minPoints: 0 },
  { level: 2, name: 'Active', minPoints: 100 },
  { level: 3, name: 'Fitness Explorer', minPoints: 500 },
  { level: 4, name: 'Fitness Champion', minPoints: 1000 },
  { level: 5, name: 'Fitness Master', minPoints: 2000 },
];

export function getLevelFromPoints(points: number): { level: number; name: string; nextLevelPoints: number | null; progressPercent: number } {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel: typeof currentLevel | null = null;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i].minPoints) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] ?? null;
    }
  }

  if (!nextLevel) {
    return { level: currentLevel.level, name: currentLevel.name, nextLevelPoints: null, progressPercent: 100 };
  }

  const range = nextLevel.minPoints - currentLevel.minPoints;
  const earned = points - currentLevel.minPoints;
  const progressPercent = Math.min(100, Math.round((earned / range) * 100));

  return { level: currentLevel.level, name: currentLevel.name, nextLevelPoints: nextLevel.minPoints, progressPercent };
}

export function calculateActivityPoints(activityType: ActivityType, durationMinutes: number): number {
  const rate = FIT_POINTS_PER_MINUTE[activityType] ?? 1;
  return rate * durationMinutes;
}

export const MOTIVATIONAL_MESSAGES = [
  'Small steps every day create big results.',
  'Your only competition is yesterday\'s you.',
  'Move more. Feel better. Stay consistent.',
  'Every activity counts. Keep going!',
  'Progress is progress, no matter how small.',
  'Your body can do it. It\'s your mind you need to convince.',
  'The only bad workout is the one that didn\'t happen.',
  'Fitness is not about being better than someone else. It\'s about being better than you used to be.',
  'Take care of your body. It\'s the only place you have to live.',
  'Don\'t stop when you\'re tired. Stop when you\'re done.',
  'Believe in yourself and all that you are capable of.',
  'Sweat is just fat crying. Keep moving!',
];

export function getDailyMotivation(): string {
  const index = new Date().getDate() % MOTIVATIONAL_MESSAGES.length;
  return MOTIVATIONAL_MESSAGES[index];
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your journey today!';
  if (streak === 1) return 'Great start! Keep it going!';
  if (streak < 7) return "You're building a habit!";
  if (streak < 14) return 'One week strong! Amazing!';
  if (streak < 30) return 'Two weeks of consistency!';
  return 'Amazing consistency! You\'re a fitness master!';
}

export const AGE_GROUPS = [
  'Child / Teen',
  'Student',
  'Working Professional',
  'Adult',
  'Senior Citizen',
  'Sports Enthusiast',
] as const;

export const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

export const FITNESS_GOALS = [
  'Improve Fitness',
  'Weight Management',
  'Increase Strength',
  'Improve Flexibility',
  'Improve Endurance',
  'Stay Active',
] as const;

export const PREFERRED_ACTIVITIES = [
  'Walking',
  'Running',
  'Cycling',
  'Yoga',
  'Gym',
  'Badminton',
  'Football',
  'Cricket',
  'Swimming',
  'Other',
] as const;

export const DAILY_AVAILABLE_TIMES = [
  '10 minutes',
  '15 minutes',
  '30 minutes',
  '45 minutes',
  '60+ minutes',
] as const;

export const GROUP_TYPES = ['Family', 'Friends', 'Community', 'Sports Team'] as const;

export const SPORT_CATEGORIES = [
  'Cricket',
  'Football',
  'Badminton',
  'Running',
  'Cycling',
  'Basketball',
  'Volleyball',
  'Other',
] as const;
