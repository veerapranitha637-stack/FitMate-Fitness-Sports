import type { Profile, Activity, ActivityType } from '@/types';
import { calculateActivityPoints } from '@/config/fitpoints';

export interface FitAIContext {
  profile: Profile | null;
  recentActivities: Activity[];
}

export interface FitAIActivitySuggestion {
  activityType: ActivityType;
  durationMinutes: number;
  pointsEstimate: number;
}

export interface FitAIResponse {
  text: string;
  suggestion?: FitAIActivitySuggestion;
  isSafetyWarning?: boolean;
}

const SAFETY_KEYWORDS = [
  'chest pain', 'fainting', 'dizzy', 'breathing difficulty', 'shortness of breath',
  'severe pain', 'injury', 'hurt', 'bleeding', 'numbness', 'tingling', 'swelling',
  'can\'t move', 'cannot move', 'palpitation', 'heart pain', 'sharp pain',
  'serious pain', 'surgery', 'fracture', 'broken bone', 'dislocate',
];

const SAFETY_RESPONSE =
  'Please stop your activity immediately. The symptoms you\'re describing may need professional medical attention. ' +
  'I\'m a general fitness assistant and cannot diagnose or treat medical conditions. ' +
  'Please contact a healthcare professional or seek emergency medical help if needed. ' +
  'Your health and safety come first.';

function checkSafety(text: string): boolean {
  const lower = text.toLowerCase();
  return SAFETY_KEYWORDS.some((kw) => lower.includes(kw));
}

function getTimeFromMessage(text: string): number | null {
  const lower = text.toLowerCase();
  const match = lower.match(/(\d+)\s*(min|minutes|minute)/);
  if (match) return parseInt(match[1], 10);
  if (lower.includes('15 min')) return 15;
  if (lower.includes('30 min')) return 30;
  if (lower.includes('45 min')) return 45;
  if (lower.includes('60 min') || lower.includes('an hour') || lower.includes('1 hour')) return 60;
  if (lower.includes('10 min')) return 10;
  return null;
}

function getActivityFromMessage(text: string): ActivityType | null {
  const lower = text.toLowerCase();
  const activityMap: Record<string, ActivityType> = {
    walking: 'Walking', walk: 'Walking', run: 'Running', running: 'Running',
    cycling: 'Cycling', bike: 'Cycling', yoga: 'Yoga', gym: 'Gym',
    badminton: 'Badminton', football: 'Football', soccer: 'Football',
    cricket: 'Cricket', swimming: 'Swimming', swim: 'Swimming',
  };
  for (const [key, val] of Object.entries(activityMap)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

function personalizeGreeting(profile: Profile | null): string {
  if (!profile) return '';
  const parts: string[] = [];
  parts.push(`I see you're a ${profile.fitness_level} in the ${profile.age_group} category`);
  if (profile.fitness_goal !== 'Stay Active') parts.push(`working toward ${profile.fitness_goal.toLowerCase()}`);
  parts.push(`with ${profile.daily_available_time} available.`);
  if (profile.current_streak > 0) parts.push(`You're on a ${profile.current_streak}-day streak — keep it up!`);
  return parts.join(' ');
}

function buildTimeBasedPlan(minutes: number, activity: ActivityType, profile: Profile | null): string {
  const warmup = Math.max(3, Math.round(minutes * 0.2));
  const cooldown = Math.max(3, Math.round(minutes * 0.2));
  const main = minutes - warmup - cooldown;
  const points = calculateActivityPoints(activity, minutes);

  const level = profile?.fitness_level ?? 'Beginner';
  const intensity = level === 'Beginner' ? 'light' : level === 'Intermediate' ? 'moderate' : 'moderate to high';

  return `Since you have ${minutes} minutes, here's a simple plan:

1. ${warmup} min — warm-up (arm circles, light movement)
2. ${main} min — ${activity.toLowerCase()} at a ${intensity} pace
3. ${cooldown} min — stretching and cool-down

You can earn approximately ${points} FitPoints by recording this activity in FitMate!`;
}

function getWeeklySummary(activities: Activity[]): string | null {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weekActivities = activities.filter((a) => new Date(a.activity_date).getTime() >= weekAgo);

  if (weekActivities.length === 0) {
    return "You haven't logged any activities this week yet. It's a great time to start! Try logging a short walk or any activity you enjoy.";
  }

  const totalMinutes = weekActivities.reduce((s, a) => s + a.duration_minutes, 0);
  const totalPoints = weekActivities.reduce((s, a) => s + a.points, 0);
  const activityCounts: Record<string, number> = {};
  weekActivities.forEach((a) => {
    activityCounts[a.activity_type] = (activityCounts[a.activity_type] ?? 0) + 1;
  });
  const mostCommon = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'various';

  return `This week you completed ${weekActivities.length} ${weekActivities.length === 1 ? 'activity' : 'activities'} for a total of ${totalMinutes} minutes and earned ${totalPoints} FitPoints. Your most common activity was ${mostCommon}. Great consistency — keep it up!`;
}

export function generateFitAIResponse(
  userMessage: string,
  context: FitAIContext,
  conversationHistory: { role: string; content: string }[] = [],
): FitAIResponse {
  // Safety check first
  if (checkSafety(userMessage)) {
    return { text: SAFETY_RESPONSE, isSafetyWarning: true };
  }

  const q = userMessage.toLowerCase();
  const profile = context.profile;
  const activities = context.recentActivities;

  // Context: previous message mentioned a time, now user says an activity
  const lastAssistant = [...conversationHistory].reverse().find((m) => m.role === 'assistant');
  const lastUser = [...conversationHistory].reverse().find((m) => m.role === 'user');
  const contextTime = lastAssistant && lastUser ? getTimeFromMessage(lastUser.content) : null;
  const mentionedActivity = getActivityFromMessage(userMessage);

  // "What did I do this week?"
  if (q.includes('this week') || q.includes('what did i do') || q.includes('my week') || q.includes('weekly summary')) {
    const summary = getWeeklySummary(activities);
    if (summary) return { text: summary };
  }

  // Time + activity context conversation
  if (mentionedActivity && contextTime) {
    const points = calculateActivityPoints(mentionedActivity, contextTime);
    const warmup = Math.max(3, Math.round(contextTime * 0.2));
    const cooldown = Math.max(3, Math.round(contextTime * 0.2));
    const main = contextTime - warmup - cooldown;
    return {
      text: `Perfect. Here's a ${contextTime}-minute ${mentionedActivity.toLowerCase()} plan:

1. ${warmup} min — warm-up
2. ${main} min — ${mentionedActivity.toLowerCase()} session
3. ${cooldown} min — cool-down stretches

You can earn approximately ${points} FitPoints for this activity! Use "Add to My Plan" below to save it.`,
      suggestion: { activityType: mentionedActivity, durationMinutes: contextTime, pointsEstimate: points },
    };
  }

  // Time-based questions
  const timeFromMsg = getTimeFromMessage(userMessage);
  if (timeFromMsg) {
    const activity = getActivityFromMessage(userMessage)
      ?? profile?.preferred_activities?.[0]
      ?? 'Walking';
    return {
      text: buildTimeBasedPlan(timeFromMsg, activity, profile),
      suggestion: { activityType: activity, durationMinutes: timeFromMsg, pointsEstimate: calculateActivityPoints(activity, timeFromMsg) },
    };
  }

  // Beginner workout
  if (q.includes('beginner')) {
    const greeting = personalizeGreeting(profile);
    return {
      text: `${greeting ? greeting + ' ' : ''}For beginners, I recommend starting with a simple 20-minute plan:

1. 5 min — warm-up (light walking, arm circles)
2. 10 min — brisk walking or easy bodyweight movements
3. 5 min — stretching cool-down

Focus on consistency over intensity. Every bit of movement counts! Try logging a walking activity after you're done.`,
      suggestion: { activityType: 'Walking', durationMinutes: 20, pointsEstimate: calculateActivityPoints('Walking', 20) },
    };
  }

  // At home / no equipment
  if (q.includes('home') || q.includes('no equipment') || q.includes('without equipment') || q.includes('indoor')) {
    return {
      text: `You can do plenty at home without any equipment! Here's a 20-minute routine:

1. 3 min — warm-up (jumping jacks, high knees)
2. 5 min — bodyweight squats (3 sets of 10-15)
3. 5 min — push-ups or wall push-ups (3 sets of 8-12)
4. 4 min — planks and lunges
5. 3 min — stretching cool-down

This can earn you about ${calculateActivityPoints('Gym', 20)} FitPoints! Use "Add to My Plan" to save it.`,
      suggestion: { activityType: 'Gym', durationMinutes: 20, pointsEstimate: calculateActivityPoints('Gym', 20) },
    };
  }

  // Weekend plan
  if (q.includes('weekend')) {
    return {
      text: `Weekends are perfect for longer, enjoyable activities! Here are some ideas:

• 45-60 min outdoor walk or run in a park
• 30 min cycling session
• A sport like badminton, football, or cricket with friends
• A longer yoga or stretching session (30-45 min)

Check the Sports Events page for upcoming weekend activities near you! You could also join a community group for group activities.`,
      suggestion: { activityType: 'Running', durationMinutes: 45, pointsEstimate: calculateActivityPoints('Running', 45) },
    };
  }

  // Consistency
  if (q.includes('consistent') || q.includes('consistency') || q.includes('motivation') || q.includes('stay on track')) {
    const streakInfo = profile && profile.current_streak > 0
      ? ` You're currently on a ${profile.current_streak}-day streak — that's fantastic momentum!`
      : '';
    return {
      text: `Staying consistent is the key to long-term fitness! Here are some tips:

1. Start small — even 10 minutes daily builds a habit
2. Set a regular time for your activity (morning or evening)
3. Join challenges for extra motivation and rewards
4. Track your streak — watching it grow is incredibly rewarding
5. Mix different activities to avoid boredom
6. Use the AI Recommendation page for fresh ideas when you're uninspired${streakInfo}

You're doing great just by asking — keep going!`,
    };
  }

  // Badminton
  if (q.includes('badminton')) {
    return {
      text: `Here are some badminton practice ideas:

1. 5 min — warm-up (jogging, arm swings, lunges)
2. 10 min — footwork drills (court coverage, split steps)
3. 10 min — basic shot practice (clears, drops, smashes)
4. 10 min — short movement drills (shadow badminton)
5. 5 min — cool-down and stretching

Focus on footwork — it's the foundation of good badminton! Log this as a badminton activity to earn FitPoints.`,
      suggestion: { activityType: 'Badminton', durationMinutes: 40, pointsEstimate: calculateActivityPoints('Badminton', 40) },
    };
  }

  // Walking challenge
  if (q.includes('walking challenge')) {
    return {
      text: `Here's a fun walking challenge you can try:

7-Day Walking Challenge:
• Day 1-2: 20 minutes of easy walking
• Day 3-4: 30 minutes of brisk walking
• Day 5-6: 40 minutes, try a new route
• Day 7: 45-60 minutes, reward yourself!

You can also join existing challenges on the Challenges page. Each day you log a walking activity, your streak and FitPoints grow. Aim for consistency!`,
      suggestion: { activityType: 'Walking', durationMinutes: 30, pointsEstimate: calculateActivityPoints('Walking', 30) },
    };
  }

  // Running consistency
  if (q.includes('running') && (q.includes('consist') || q.includes('improve'))) {
    return {
      text: `To improve your running consistency:

1. Start with a manageable distance — don't overdo it early on
2. Follow a run-walk pattern if you're building endurance (e.g., 3 min run / 1 min walk)
3. Aim for 3-4 runs per week with rest days in between
4. Gradually increase distance by no more than 10% per week
5. Track each run in FitMate to build your streak and earn FitPoints
6. Mix in stretching or yoga on rest days for recovery

Consistency beats speed — just keep showing up!`,
      suggestion: { activityType: 'Running', durationMinutes: 30, pointsEstimate: calculateActivityPoints('Running', 30) },
    };
  }

  // Football
  if (q.includes('football') || q.includes('soccer')) {
    return {
      text: `Here's a simple football fitness routine:

1. 5 min — warm-up (light jog, dynamic stretches)
2. 10 min — running drills (sprints, intervals)
3. 10 min — agility exercises (cone drills, lateral movements)
4. 10 min — ball work (dribbling, passing drills)
5. 5 min — cool-down and stretching

This combines cardio with sport-specific skills. Log it as a football activity afterward!`,
      suggestion: { activityType: 'Football', durationMinutes: 40, pointsEstimate: calculateActivityPoints('Football', 40) },
    };
  }

  // Senior
  if (q.includes('senior') || q.includes('elderly') || q.includes('older')) {
    return {
      text: `For seniors, I recommend gentle, low-impact activities:

1. Daily walking (20-30 min) at a comfortable pace
2. Light stretching or yoga for flexibility (15-20 min)
3. Simple mobility exercises for joints
4. Water-based activities like swimming if available

Always move at a comfortable pace and stop if you feel any discomfort. This is general fitness guidance — please consult a healthcare professional for specific advice.`,
      suggestion: { activityType: 'Walking', durationMinutes: 25, pointsEstimate: calculateActivityPoints('Walking', 25) },
    };
  }

  // Weight management
  if (q.includes('weight') || q.includes('lose') || q.includes('fat')) {
    return {
      text: `For weight management, combine regular activity with balanced nutrition:

1. Aim for 30-45 minutes of moderate activity most days
2. Great options: brisk walking, cycling, or swimming
3. Mix cardio with some strength training (bodyweight exercises work well)
4. Stay hydrated and maintain a balanced diet
5. Track your activities in FitMate to stay motivated and earn FitPoints

Remember, this is general fitness guidance — for personalized advice, consult a healthcare professional.`,
      suggestion: { activityType: 'Walking', durationMinutes: 40, pointsEstimate: calculateActivityPoints('Walking', 40) },
    };
  }

  // Strength
  if (q.includes('strength') || q.includes('muscle') || q.includes('gym')) {
    return {
      text: `To build strength, focus on progressive overload — gradually increase weight or resistance:

1. Great options: gym sessions, bodyweight exercises (push-ups, squats, planks), or resistance bands
2. Aim for 30-45 minutes, 3-4 times per week
3. Allow rest days between strength sessions for recovery
4. Focus on form over weight — quality reps are more effective
5. Track your sessions in FitMate to stay consistent

Log gym sessions or bodyweight workouts to earn FitPoints!`,
      suggestion: { activityType: 'Gym', durationMinutes: 40, pointsEstimate: calculateActivityPoints('Gym', 40) },
    };
  }

  // Flexibility
  if (q.includes('flexib') || q.includes('stretch')) {
    return {
      text: `For flexibility, try daily stretching or yoga:

1. Hold each stretch for 20-30 seconds without bouncing
2. Focus on major muscle groups: hamstrings, hips, shoulders, and back
3. Even 15 minutes daily can make a big difference over time
4. Breathe deeply and never force a stretch
5. Yoga sessions also earn you FitPoints!

Try logging a yoga activity after your stretching session.`,
      suggestion: { activityType: 'Yoga', durationMinutes: 20, pointsEstimate: calculateActivityPoints('Yoga', 20) },
    };
  }

  // Streak info
  if (q.includes('streak') || q.includes('how am i doing')) {
    if (profile && profile.current_streak > 0) {
      return {
        text: `You're on a ${profile.current_streak}-day streak! Your longest streak is ${profile.longest_streak} days. You've earned ${profile.total_points} total FitPoints and you're at Level ${profile.level}. Keep logging activities daily to grow your streak even further!`,
      };
    }
    return {
      text: 'You haven\'t started a streak yet. Log an activity today to begin your streak! Even a 10-minute walk counts. Consistency is key — try to log something every day.',
    };
  }

  // Default / fallback
  const greeting = personalizeGreeting(profile);
  return {
    text: `${greeting ? greeting + ' ' : ''}I can help with activity suggestions, workout plans, sports tips, and fitness motivation. Try asking:
• "I only have 15 minutes today"
• "Give me a beginner workout"
• "Suggest a badminton practice routine"
• "What did I do this week?"
• "How can I stay consistent?"

You can also visit the AI Recommendation page for a personalized plan based on your profile!`,
  };
}

export const QUICK_QUESTIONS = [
  'Give me a beginner workout',
  'I only have 15 minutes today',
  'Suggest an activity I can do at home',
  'How can I stay consistent?',
  'Suggest a weekend fitness plan',
  'Give me badminton practice ideas',
  'Suggest a walking challenge',
  'What can I do without equipment?',
];
