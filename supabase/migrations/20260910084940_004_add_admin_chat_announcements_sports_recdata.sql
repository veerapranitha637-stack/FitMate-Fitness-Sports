/*
# Add role, chat_messages, announcements, sports_categories, recommendation_history

Adds admin/user role support, chat persistence for FitAI,
announcements for admin-to-user communication, sports category management,
and recommendation history tracking.
*/

-- 1. Add role column to profiles (defaults to 'user')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. chat_messages table for FitAI conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chat_messages" ON chat_messages;
CREATE POLICY "select_own_chat_messages" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chat_messages" ON chat_messages;
CREATE POLICY "insert_own_chat_messages" ON chat_messages
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chat_messages" ON chat_messages;
CREATE POLICY "delete_own_chat_messages" ON chat_messages
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id, created_at);

-- 3. announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_announcements" ON announcements;
CREATE POLICY "select_all_announcements" ON announcements FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_announcements_admin" ON announcements;
CREATE POLICY "insert_announcements_admin" ON announcements
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "update_announcements_admin" ON announcements;
CREATE POLICY "update_announcements_admin" ON announcements FOR UPDATE
  TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "delete_announcements_admin" ON announcements;
CREATE POLICY "delete_announcements_admin" ON announcements
  TO authenticated USING (auth.uid() = created_by);

-- 4. sports_categories table
CREATE TABLE IF NOT EXISTS sports_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'Activity',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sports_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_sports_categories" ON sports_categories;
CREATE POLICY "select_all_sports_categories" ON sports_categories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_sports_categories_admin" ON sports_categories;
CREATE POLICY "insert_sports_categories_admin" ON sports_categories
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "update_sports_categories_admin" ON sports_categories;
CREATE POLICY "update_sports_categories_admin" ON sports_categories FOR UPDATE
  TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "delete_sports_categories_admin" ON sports_categories;
CREATE POLICY "delete_sports_categories_admin" ON sports_categories
  TO authenticated USING (auth.uid() = created_by);

-- 5. recommendation_history table
CREATE TABLE IF NOT EXISTS recommendation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  duration_minutes integer NOT NULL,
  goal text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_rec_history" ON recommendation_history;
CREATE POLICY "select_own_rec_history" ON recommendation_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_rec_history" ON recommendation_history;
CREATE POLICY "insert_own_rec_history" ON recommendation_history
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_rec_history" ON recommendation_history;
CREATE POLICY "update_own_rec_history" ON recommendation_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rec_history_user ON recommendation_history(user_id, created_at);

-- 6. Add is_active column to profiles for user deactivation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 7. Add registration_deadline and status to sports_events
ALTER TABLE sports_events ADD COLUMN IF NOT EXISTS registration_deadline date;
ALTER TABLE sports_events ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'));
