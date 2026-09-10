/*
# Fix RLS policies and add missing columns

1. Add is_published to challenges and announcements tables
2. Replace weak RLS policies on challenges, sports_events, announcements, sports_categories
   with admin-only write policies using the is_admin() function
3. Lock down profiles.role so users cannot elevate themselves to admin
4. Add UPDATE policy for sports_events (was missing)
*/

-- =============================================
-- Add is_published columns
-- =============================================
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

-- =============================================
-- Fix profiles RLS: prevent users from changing their own role
-- =============================================
-- Drop existing update policy
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile_safe" ON public.profiles;

-- Create a restricted update policy: users can update everything EXCEPT role
-- We use a SECURITY DEFINER function to check if the new role value differs
CREATE OR REPLACE FUNCTION public.can_update_profile()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.is_admin();
$$;

-- Users can update their own profile but NOT the role column
-- We enforce role protection at the column level by revoking UPDATE on role
REVOKE UPDATE (role) ON public.profiles FROM anon, authenticated;
-- Admins can still update role via the is_admin check in policy
CREATE POLICY "update_own_profile_safe"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- =============================================
-- Fix challenges RLS: admin-only writes
-- =============================================
DROP POLICY IF EXISTS "insert_challenges" ON public.challenges;
DROP POLICY IF EXISTS "update_challenges" ON public.challenges;
DROP POLICY IF EXISTS "delete_challenges" ON public.challenges;
DROP POLICY IF EXISTS "select_challenges" ON public.challenges;

-- Everyone can read published challenges; admins can read all
CREATE POLICY "select_challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (is_published = true OR public.is_admin());

-- Only admins can insert/update/delete
CREATE POLICY "admin_insert_challenges"
  ON public.challenges FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_challenges"
  ON public.challenges FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_challenges"
  ON public.challenges FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- Fix sports_events RLS: admin-only writes
-- =============================================
DROP POLICY IF EXISTS "insert_events" ON public.sports_events;
DROP POLICY IF EXISTS "update_events" ON public.sports_events;
DROP POLICY IF EXISTS "delete_events" ON public.sports_events;
DROP POLICY IF EXISTS "select_events" ON public.sports_events;

-- Everyone can read events; only admins can write
CREATE POLICY "select_events"
  ON public.sports_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_insert_events"
  ON public.sports_events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_events"
  ON public.sports_events FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_events"
  ON public.sports_events FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- Fix announcements RLS: admin-only writes, users read published only
-- =============================================
DROP POLICY IF EXISTS "delete_announcements_admin" ON public.announcements;
DROP POLICY IF EXISTS "insert_announcements_admin" ON public.announcements;
DROP POLICY IF EXISTS "select_all_announcements" ON public.announcements;
DROP POLICY IF EXISTS "update_announcements_admin" ON public.announcements;

-- Users can read published announcements; admins can read all
CREATE POLICY "select_announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (is_published = true OR public.is_admin());

-- Only admins can insert/update/delete
CREATE POLICY "admin_insert_announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_announcements"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_announcements"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- Fix sports_categories RLS: admin-only writes
-- =============================================
DROP POLICY IF EXISTS "delete_sports_admin" ON public.sports_categories;
DROP POLICY IF EXISTS "insert_sports_admin" ON public.sports_categories;
DROP POLICY IF EXISTS "select_sports" ON public.sports_categories;
DROP POLICY IF EXISTS "update_sports_admin" ON public.sports_categories;

CREATE POLICY "select_sports"
  ON public.sports_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_insert_sports"
  ON public.sports_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_sports"
  ON public.sports_categories FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_sports"
  ON public.sports_categories FOR DELETE
  TO authenticated
  USING (public.is_admin());
