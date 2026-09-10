import type {
  Recommendation,
  RecommendationPhase,
  Profile,
  Activity,
  AgeGroup,
  FitnessLevel,
  FitnessGoal,
  ActivityType,
  DailyAvailableTime,
} from '@/types';

function parseMinutes(time: DailyAvailableTime): number {
  const match = time.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
}

function getWarmUp(level: FitnessLevel, minutes: number): RecommendationPhase {
  const ratio = level === 'Beginner' ? 0.2 : level === 'Intermediate' ? 0.15 : 0.1;
  const duration = Math.max(3, Math.round(minutes * ratio));
  return {
    title: 'Warm-Up',
    duration,
    description: 'Light movements to prepare your body: arm circles, leg swings, and gentle jogging in place.',
    icon: 'Flame',
  };
}

function getCoolDown(level: FitnessLevel, minutes: number): RecommendationPhase {
  const ratio = level === 'Beginner' ? 0.2 : level === 'Intermediate' ? 0.15 : 0.1;
  const duration = Math.max(3, Math.round(minutes * ratio));
  return {
    title: 'Cool Down & Stretch',
    duration,
    description: 'Slow stretches for hamstrings, quads, shoulders, and back. Hold each stretch for 20-30 seconds.',
    icon: 'Wind',
  };
}

function getActivityPhase(
  activity: ActivityType,
  level: FitnessLevel,
  minutes: number,
): { phase: RecommendationPhase; pointsPerMinute: number } {
  const warmUpDuration = level === 'Beginner' ? Math.round(minutes * 0.2) : Math.round(minutes * 0.15);
  const coolDownDuration = level === 'Beginner' ? Math.round(minutes * 0.2) : Math.round(minutes * 0.15);
  const mainDuration = minutes - warmUpDuration - coolDownDuration;

  const pointsPerMinute: Record<ActivityType, number> = {
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

  const descriptions: Record<ActivityType, string> = {
    Walking: 'Brisk walking at a comfortable pace. Keep your posture upright and swing your arms naturally.',
    Running: 'Steady-paced running. Focus on breathing rhythm and maintaining consistent form.',
    Cycling: 'Continuous cycling at a moderate pace. Adjust gears for comfort and stay hydrated.',
    Yoga: 'Follow a sequence of yoga poses. Focus on your breath and hold each pose mindfully.',
    Gym: 'Strength training with moderate weights. Focus on form over weight.',
    Badminton: 'Practice rallies and footwork. Focus on court movement and shot accuracy.',
    Football: 'Dribbling, passing drills, and light practice matches. Stay hydrated.',
    Cricket: 'Batting practice, bowling drills, or fielding exercises. Focus on technique.',
    Swimming: 'Swim laps at a comfortable pace. Alternate strokes for variety.',
    Other: 'Engage in your preferred activity at a moderate intensity.',
  };

  return {
    phase: {
      title: `${activity} Session`,
      duration: Math.max(5, mainDuration),
      description: descriptions[activity],
      icon: 'Activity',
    },
    pointsPerMinute: pointsPerMinute[activity],
  };
}

function getAgeGroupAdjustments(ageGroup: AgeGroup): { activities: ActivityType[]; note: string } {
  switch (ageGroup) {
    case 'Child / Teen':
      return {
        activities: ['Walking', 'Running', 'Cycling', 'Football', 'Badminton', 'Swimming'],
        note: 'Keep it fun and playful! Mix activities to stay engaged.',
      };
    case 'Senior Citizen':
      return {
        activities: ['Walking', 'Yoga'],
        note: 'Low-impact, gentle movements. Stop if you feel discomfort. Stay hydrated.',
      };
    case 'Sports Enthusiast':
      return {
        activities: ['Running', 'Cycling', 'Football', 'Badminton', 'Cricket', 'Swimming', 'Gym'],
        note: 'Focus on sport-specific drills and endurance building.',
      };
    default:
      return {
        activities: [],
        note: '',
      };
  }
}

function getGoalTips(goal: FitnessGoal): string[] {
  const tips: Record<FitnessGoal, string[]> = {
    'Improve Fitness': [
      'Aim for consistency over intensity — daily movement matters most.',
      'Gradually increase your activity time each week.',
    ],
    'Weight Management': [
      'Combine regular activity with balanced nutrition.',
      'Stay hydrated and aim for at least 30 minutes of activity daily.',
    ],
    'Increase Strength': [
      'Focus on progressive overload — gradually increase weight or resistance.',
      'Ensure adequate rest between strength sessions for recovery.',
    ],
    'Improve Flexibility': [
      'Hold each stretch for 20-30 seconds without bouncing.',
      'Practice daily for best results — flexibility improves with consistency.',
    ],
    'Improve Endurance': [
      'Gradually increase duration rather than speed.',
      'Mix steady-state cardio with occasional intervals.',
    ],
    'Stay Active': [
      'Any movement is good movement — keep it enjoyable!',
      'Try different activities to find what you love.',
    ],
  };
  return tips[goal] || tips['Stay Active'];
}

function getRecentActivityFactor(recentActivities: Activity[]): number {
  const last7Days = recentActivities.filter((a) => {
    const daysAgo = (Date.now() - new Date(a.activity_date).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });
  if (last7Days.length >= 5) return 0.9; // Very active — suggest slightly lighter
  if (last7Days.length >= 3) return 1.0; // Moderately active
  return 1.1; // Less active — encourage a bit more
}

export function generateRecommendation(
  profile: {
    age_group: AgeGroup;
    fitness_level: FitnessLevel;
    fitness_goal: FitnessGoal;
    preferred_activities: ActivityType[];
    daily_available_time: DailyAvailableTime;
  },
  recentActivities: Activity[] = [],
): Recommendation {
  const minutes = Math.round(parseMinutes(profile.daily_available_time) * getRecentActivityFactor(recentActivities));
  const level = profile.fitness_level;
  const ageAdjust = getAgeGroupAdjustments(profile.age_group);

  // Pick preferred activity — use first preferred, fallback to age-suggested, then Walking
  let chosenActivity: ActivityType = 'Walking';
  if (profile.preferred_activities.length > 0) {
    chosenActivity = profile.preferred_activities[0];
  } else if (ageAdjust.activities.length > 0) {
    chosenActivity = ageAdjust.activities[0];
  }

  // For senior citizens, override with gentler activities
  if (profile.age_group === 'Senior Citizen') {
    chosenActivity = profile.preferred_activities.includes('Walking')
      ? 'Walking'
      : profile.preferred_activities.includes('Yoga')
        ? 'Yoga'
        : 'Walking';
  }

  // For flexibility goal, suggest yoga if available
  if (profile.fitness_goal === 'Improve Flexibility' && profile.preferred_activities.includes('Yoga')) {
    chosenActivity = 'Yoga';
  }

  const warmUp = getWarmUp(level, minutes);
  const coolDown = getCoolDown(level, minutes);
  const { phase: activityPhase, pointsPerMinute } = getActivityPhase(chosenActivity, level, minutes);

  const phases = [warmUp, activityPhase, coolDown];
  const pointsEstimate = phases.reduce((sum, p) => sum + p.duration * pointsPerMinute, 0);

  const tips = [...getGoalTips(profile.fitness_goal)];
  if (ageAdjust.note) tips.push(ageAdjust.note);
  tips.push('This is general fitness guidance, not medical advice. Consult a healthcare professional for specific concerns.');

  const nutritionTips: Record<FitnessGoal, string> = {
    'Improve Fitness': 'Choose a balanced meal containing vegetables, whole grains and a protein source.',
    'Weight Management': 'Opt for smaller, balanced portions with vegetables and lean protein. Stay hydrated.',
    'Increase Strength': 'Include a protein source with each meal to support muscle recovery.',
    'Improve Flexibility': 'Stay hydrated and include fruits and vegetables to support joint health.',
    'Improve Endurance': 'Include complex carbohydrates for sustained energy and stay hydrated.',
    'Stay Active': 'Choose a balanced meal containing vegetables, whole grains and a protein source.',
  };
  const nutritionTip = nutritionTips[profile.fitness_goal] ?? nutritionTips['Stay Active'];

  const title = `${minutes}-Minute ${profile.fitness_goal === 'Improve Flexibility' ? 'Flexibility' : 'Fitness'} Plan`;

  return {
    title,
    activityType: chosenActivity,
    durationLabel: `${minutes} minutes`,
    totalMinutes: minutes,
    difficulty: level,
    pointsEstimate: Math.round(pointsEstimate),
    phases,
    tips,
    disclaimer: true,
    nutritionTip,
  };
}

export function generateFlexibilityRecommendation(
  profile: { fitness_level: FitnessLevel; daily_available_time: DailyAvailableTime },
): Recommendation {
  const minutes = parseMinutes(profile.daily_available_time);
  const level = profile.fitness_level;

  const phases: RecommendationPhase[] = [
    {
      title: 'Gentle Warm-Up',
      duration: Math.max(3, Math.round(minutes * 0.15)),
      description: 'Neck rolls, shoulder shrugs, and gentle torso twists to warm up.',
      icon: 'Flame',
    },
    {
      title: 'Stretching Routine',
      duration: Math.round(minutes * 0.5),
      description: 'Hamstring stretches, quad stretches, hip openers, and shoulder stretches. Hold each for 20-30 seconds.',
      icon: 'Activity',
    },
    {
      title: 'Beginner Yoga Poses',
      duration: Math.round(minutes * 0.25),
      description: 'Cat-cow, child\'s pose, downward dog, and cobra pose. Breathe deeply and move slowly.',
      icon: 'Activity',
    },
    {
      title: 'Mobility Exercises',
      duration: Math.max(3, Math.round(minutes * 0.1)),
      description: 'Joint mobility: ankle circles, wrist circles, and spine mobility. Gentle, controlled movements.',
      icon: 'Wind',
    },
  ];

  return {
    title: `${minutes}-Minute Flexibility & Mobility Plan`,
    activityType: 'Yoga',
    durationLabel: `${minutes} minutes`,
    totalMinutes: minutes,
    difficulty: level,
    pointsEstimate: minutes * 1,
    phases,
    tips: [
      'Hold each stretch for 20-30 seconds without bouncing.',
      'Breathe deeply and never force a stretch.',
      'This is general fitness guidance, not medical advice.',
    ],
    disclaimer: true,
    nutritionTip: 'Stay hydrated and include fruits and vegetables to support joint health.',
  };
}

// AI API integration point — if VITE_AI_API_KEY is set, this would call an AI service
export async function generateAIRecommendation(profile: Profile, recentActivities: Activity[]): Promise<Recommendation> {
  const apiKey = import.meta.env.VITE_AI_API_KEY as string | undefined;

  if (!apiKey) {
    // Fall back to rule-based engine
    return generateRecommendation(profile, recentActivities);
  }

  // When AI API is configured, the request would be sent to an edge function
  // that proxies to the AI service. For now, use the rule-based engine.
  return generateRecommendation(profile, recentActivities);
}
