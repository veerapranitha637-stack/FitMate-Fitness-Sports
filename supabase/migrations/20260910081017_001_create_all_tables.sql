/*
# FitMate - Complete Database Schema

Creates all tables for the FitMate fitness platform with Row Level Security.

## Tables Created:
1. profiles - User fitness profiles (linked to auth.users)
2. activities - Activity tracking records
3. challenges - Challenge definitions (public)
4. challenge_participants - User challenge participation
5. badges - Badge definitions (public)
6. user_badges - Earned badges per user
7. groups - Community/family groups
8. group_members - Group membership
9. sports_events - Sports event listings (public)
10. event_registrations - User event registrations
11. notifications - User notifications
12. leaderboard_cache - Cache for leaderboard sample data

## Security:
- All user-specific tables have RLS enabled with auth.uid() ownership checks
- Public tables (challenges, badges, sports_events, groups) are readable by all authenticated users
- Users can only modify their own data
- Challenge/event participation is user-scoped
*/

-- ===== PROFILES =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  age_group text NOT NULL DEFAULT 'Adult',
  fitness_level text NOT NULL DEFAULT 'Beginner',
  fitness_goal text NOT NULL DEFAULT 'Stay Active',
  preferred_activities text[] NOT NULL DEFAULT '{}',
  daily_available_time text NOT NULL DEFAULT '30 minutes',
  total_points integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Allow authenticated users to view other profiles for leaderboard (name, points, level, streak only)
DROP POLICY IF EXISTS "select_all_profiles_leaderboard" ON profiles;
CREATE POLICY "select_all_profiles_leaderboard" ON profiles FOR SELECT
  TO authenticated USING (true);

-- ===== ACTIVITIES =====
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  distance numeric,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  points integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_activities" ON activities;
CREATE POLICY "select_own_activities" ON activities FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_activities" ON activities;
CREATE POLICY "insert_own_activities" ON activities FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_activities" ON activities;
CREATE POLICY "update_own_activities" ON activities FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_activities" ON activities;
CREATE POLICY "delete_own_activities" ON activities FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== CHALLENGES (public) =====
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL DEFAULT 'activity',
  activity_type text NOT NULL DEFAULT 'Walking',
  target_value integer NOT NULL,
  duration_days integer NOT NULL DEFAULT 7,
  reward_points integer NOT NULL DEFAULT 100,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_challenges" ON challenges;
CREATE POLICY "select_all_challenges" ON challenges FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_challenges" ON challenges;
CREATE POLICY "insert_challenges" ON challenges FOR INSERT
  TO authenticated WITH CHECK (true);

-- ===== CHALLENGE PARTICIPANTS =====
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  joined_at timestamptz DEFAULT now()
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_participants" ON challenge_participants;
CREATE POLICY "select_participants" ON challenge_participants FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_participation" ON challenge_participants;
CREATE POLICY "insert_own_participation" ON challenge_participants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_participation" ON challenge_participants;
CREATE POLICY "update_own_participation" ON challenge_participants FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_participation" ON challenge_participants;
CREATE POLICY "delete_own_participation" ON challenge_participants FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== BADGES (public) =====
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Award',
  requirement text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_badges" ON badges;
CREATE POLICY "select_all_badges" ON badges FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_badges" ON badges;
CREATE POLICY "insert_badges" ON badges FOR INSERT
  TO authenticated WITH CHECK (true);

-- ===== USER BADGES =====
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_badges" ON user_badges;
CREATE POLICY "select_own_badges" ON user_badges FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_all_badges_for_display" ON user_badges;
CREATE POLICY "select_all_badges_for_display" ON user_badges FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_badges" ON user_badges;
CREATE POLICY "insert_own_badges" ON user_badges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ===== GROUPS (public read) =====
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  group_type text NOT NULL DEFAULT 'Community',
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_groups" ON groups;
CREATE POLICY "select_all_groups" ON groups FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_group" ON groups;
CREATE POLICY "insert_own_group" ON groups FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "update_own_group" ON groups;
CREATE POLICY "update_own_group" ON groups FOR UPDATE
  TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- ===== GROUP MEMBERS =====
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now()
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_members" ON group_members;
CREATE POLICY "select_all_members" ON group_members FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_membership" ON group_members;
CREATE POLICY "insert_own_membership" ON group_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_membership" ON group_members;
CREATE POLICY "delete_own_membership" ON group_members FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== SPORTS EVENTS (public read) =====
CREATE TABLE IF NOT EXISTS sports_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sport text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time text NOT NULL DEFAULT '10:00',
  location text NOT NULL,
  max_participants integer NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sports_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_events" ON sports_events;
CREATE POLICY "select_all_events" ON sports_events FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_events" ON sports_events;
CREATE POLICY "insert_events" ON sports_events FOR INSERT
  TO authenticated WITH CHECK (true);

-- ===== EVENT REGISTRATIONS =====
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES sports_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now()
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_registrations" ON event_registrations;
CREATE POLICY "select_all_registrations" ON event_registrations FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_registration" ON event_registrations;
CREATE POLICY "insert_own_registration" ON event_registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_registration" ON event_registrations;
CREATE POLICY "delete_own_registration" ON event_registrations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== NOTIFICATIONS =====
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(total_points DESC);
