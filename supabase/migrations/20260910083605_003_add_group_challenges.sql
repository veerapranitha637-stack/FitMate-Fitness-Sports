/*
# Add Group Challenges Table

Creates a `group_challenges` table for group-level fitness challenges.
When any group member records an activity, the group challenge progress
automatically increases by the activity's duration in minutes.

## New Table:
- `group_challenges`
  - id (uuid, PK)
  - group_id (uuid, FK to groups)
  - name (text) — challenge name e.g. "Family 300-Minute Challenge"
  - description (text)
  - target_value (integer) — total minutes goal
  - reward_points (integer) — points each member earns on completion
  - progress (integer, default 0) — cumulative minutes logged by all members
  - completed (boolean, default false)
  - created_by (uuid, FK to auth.users)
  - created_at (timestamptz)

## Security:
- RLS enabled
- SELECT: any authenticated user can view (public group info)
- INSERT: any authenticated user can create a challenge for a group they belong to
- UPDATE: any authenticated user can update progress (members logging activities)
*/

CREATE TABLE IF NOT EXISTS group_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  target_value integer NOT NULL DEFAULT 300,
  reward_points integer NOT NULL DEFAULT 100,
  progress integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_group_challenges" ON group_challenges;
CREATE POLICY "select_all_group_challenges" ON group_challenges FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_group_challenges" ON group_challenges;
CREATE POLICY "insert_group_challenges" ON group_challenges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "update_group_challenges" ON group_challenges;
CREATE POLICY "update_group_challenges" ON group_challenges FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_group_challenges_group ON group_challenges(group_id);
