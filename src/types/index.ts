export type AgeGroup =
  | 'Child / Teen'
  | 'Student'
  | 'Working Professional'
  | 'Adult'
  | 'Senior Citizen'
  | 'Sports Enthusiast';

export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type FitnessGoal =
  | 'Improve Fitness'
  | 'Weight Management'
  | 'Increase Strength'
  | 'Improve Flexibility'
  | 'Improve Endurance'
  | 'Stay Active';

export type ActivityType =
  | 'Walking'
  | 'Running'
  | 'Cycling'
  | 'Yoga'
  | 'Gym'
  | 'Badminton'
  | 'Football'
  | 'Cricket'
  | 'Swimming'
  | 'Other';

export type DailyAvailableTime =
  | '10 minutes'
  | '15 minutes'
  | '30 minutes'
  | '45 minutes'
  | '60+ minutes';

export type GroupType = 'Family' | 'Friends' | 'Community' | 'Sports Team';

export type SportCategory =
  | 'Cricket'
  | 'Football'
  | 'Badminton'
  | 'Running'
  | 'Cycling'
  | 'Basketball'
  | 'Volleyball'
  | 'Swimming'
  | 'Other';

export type UserRole = 'user' | 'admin';

export type ExerciseLocation = 'Home' | 'Outdoor' | 'Gym' | 'Sports Ground' | 'Anywhere';
export type CurrentFeeling = 'Energetic' | 'Normal' | 'Tired' | 'Busy';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  age_group: AgeGroup;
  fitness_level: FitnessLevel;
  fitness_goal: FitnessGoal;
  preferred_activities: ActivityType[];
  daily_available_time: DailyAvailableTime;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  level: number;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  duration_minutes: number;
  distance: number | null;
  activity_date: string;
  points: number;
  notes: string | null;
  created_at: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: string;
  activity_type: ActivityType;
  target_value: number;
  duration_days: number;
  reward_points: number;
  start_date: string;
  end_date: string | null;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  completed: boolean;
  joined_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  group_type: GroupType;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface GroupChallenge {
  id: string;
  group_id: string;
  name: string;
  description: string;
  target_value: number;
  reward_points: number;
  progress: number;
  completed: boolean;
  created_by: string;
  created_at: string;
}

export interface SportsEvent {
  id: string;
  name: string;
  sport: SportCategory;
  description: string | null;
  event_date: string;
  event_time: string;
  location: string;
  max_participants: number;
  registration_deadline: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  created_by: string;
  created_at: string;
}

export interface SportCategoryItem {
  id: string;
  name: string;
  icon: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface RecommendationHistoryItem {
  id: string;
  user_id: string;
  activity_type: string;
  duration_minutes: number;
  goal: string;
  completed: boolean;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalActivities: number;
  totalFitPoints: number;
  activeChallenges: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalFitnessTips: number;
  totalFoodRecs: number;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  age_group: string;
  fitness_level: string;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  level: number;
  weekly_points?: number;
  isCurrentUser?: boolean;
}

export interface RecommendationPhase {
  title: string;
  duration: number;
  description: string;
  icon: string;
}

export interface Recommendation {
  title: string;
  activityType: ActivityType;
  durationLabel: string;
  totalMinutes: number;
  difficulty: FitnessLevel;
  pointsEstimate: number;
  phases: RecommendationPhase[];
  tips: string[];
  disclaimer: boolean;
  nutritionTip?: string;
}

export interface FitnessInformation {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: string;
  duration_minutes: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FoodRecommendation {
  id: string;
  food_name: string;
  category: string;
  description: string;
  benefits: string;
  best_time: string;
  fitness_goal: string;
  age_group: string;
  fitness_level: string;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
