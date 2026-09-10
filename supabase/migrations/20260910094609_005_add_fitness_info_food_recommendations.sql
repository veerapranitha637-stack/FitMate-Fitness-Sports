/*
# Add Fitness Information and Food Recommendations tables

1. New Tables
- `fitness_information`: Admin-managed fitness tips/articles with category, difficulty, duration, publish/unpublish
- `food_recommendations`: Admin-managed food/nutrition suggestions with category, benefits, best_time, fitness_goal, age_group, fitness_level, publish/unpublish

2. Security
- Both tables have RLS enabled
- Users (authenticated) can READ only published rows
- Admins can perform full CRUD (admin check via profile role)
- No user can insert/update/delete these tables — only admins

3. Notes
- `created_by` defaults to auth.uid() for admin tracking
- `is_published` defaults to false so admins can review before publishing
- Admin write access is enforced via a SECURITY DEFINER function `is_admin()` that checks the profiles table
*/

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- =============================================
-- FITNESS INFORMATION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.fitness_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General Fitness',
  description text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'Beginner',
  duration_minutes integer NOT NULL DEFAULT 30,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fitness_information ENABLE ROW LEVEL SECURITY;

-- Users can read published fitness information
DROP POLICY IF EXISTS "read_published_fitness_info" ON public.fitness_information;
CREATE POLICY "read_published_fitness_info"
  ON public.fitness_information FOR SELECT
  TO authenticated
  USING (is_published = true OR public.is_admin());

-- Admins can insert
DROP POLICY IF EXISTS "admin_insert_fitness_info" ON public.fitness_information;
CREATE POLICY "admin_insert_fitness_info"
  ON public.fitness_information FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update
DROP POLICY IF EXISTS "admin_update_fitness_info" ON public.fitness_information;
CREATE POLICY "admin_update_fitness_info"
  ON public.fitness_information FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete
DROP POLICY IF EXISTS "admin_delete_fitness_info" ON public.fitness_information;
CREATE POLICY "admin_delete_fitness_info"
  ON public.fitness_information FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- FOOD RECOMMENDATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.food_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name text NOT NULL,
  category text NOT NULL DEFAULT 'Snack',
  description text NOT NULL DEFAULT '',
  benefits text NOT NULL DEFAULT '',
  best_time text NOT NULL DEFAULT 'Anytime',
  fitness_goal text NOT NULL DEFAULT 'Stay Active',
  age_group text NOT NULL DEFAULT 'All Ages',
  fitness_level text NOT NULL DEFAULT 'All Levels',
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.food_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can read published food recommendations
DROP POLICY IF EXISTS "read_published_food_recs" ON public.food_recommendations;
CREATE POLICY "read_published_food_recs"
  ON public.food_recommendations FOR SELECT
  TO authenticated
  USING (is_published = true OR public.is_admin());

-- Admins can insert
DROP POLICY IF EXISTS "admin_insert_food_rec" ON public.food_recommendations;
CREATE POLICY "admin_insert_food_rec"
  ON public.food_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update
DROP POLICY IF EXISTS "admin_update_food_rec" ON public.food_recommendations;
CREATE POLICY "admin_update_food_rec"
  ON public.food_recommendations FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete
DROP POLICY IF EXISTS "admin_delete_food_rec" ON public.food_recommendations;
CREATE POLICY "admin_delete_food_rec"
  ON public.food_recommendations FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_fitness_info_published ON public.fitness_information(is_published, category);
CREATE INDEX IF NOT EXISTS idx_food_recs_published ON public.food_recommendations(is_published, fitness_goal, age_group, fitness_level);

-- =============================================
-- SEED SAMPLE DATA
-- =============================================
INSERT INTO public.fitness_information (title, category, description, difficulty, duration_minutes, is_published, created_by)
SELECT 'Benefits of Daily Walking', 'Walking', 'Regular walking can support general physical activity and fitness. Aim for 30 minutes a day at a brisk pace to build consistency.', 'Beginner', 30, true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.fitness_information WHERE title = 'Benefits of Daily Walking');

INSERT INTO public.fitness_information (title, category, description, difficulty, duration_minutes, is_published, created_by)
SELECT 'Beginner Running Guide', 'Running', 'Start with a mix of walking and running. Try 1 minute jog, 2 minutes walk, repeated for 20 minutes. Gradually increase jogging time each week.', 'Beginner', 20, true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.fitness_information WHERE title = 'Beginner Running Guide');

INSERT INTO public.fitness_information (title, category, description, difficulty, duration_minutes, is_published, created_by)
SELECT 'Yoga for Flexibility', 'Yoga', 'Daily yoga practice can improve flexibility and reduce stiffness. Focus on gentle stretches and deep breathing. Hold each pose for 20-30 seconds.', 'Beginner', 25, true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.fitness_information WHERE title = 'Yoga for Flexibility');

INSERT INTO public.fitness_information (title, category, description, difficulty, duration_minutes, is_published, created_by)
SELECT 'Strength Training Basics', 'Strength', 'Start with bodyweight exercises: squats, push-ups, and planks. Focus on form first, then gradually add resistance.', 'Intermediate', 40, true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.fitness_information WHERE title = 'Strength Training Basics');

INSERT INTO public.fitness_information (title, category, description, difficulty, duration_minutes, is_published, created_by)
SELECT 'Cycling for Endurance', 'Cycling', 'Build endurance with steady-paced cycling. Start with 30-minute rides and gradually increase duration. Stay hydrated and maintain proper posture.', 'Intermediate', 45, true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.fitness_information WHERE title = 'Cycling for Endurance');

INSERT INTO public.food_recommendations (food_name, category, description, benefits, best_time, fitness_goal, age_group, fitness_level, is_published, created_by)
SELECT 'Oats with Fruit and Yogurt', 'Breakfast', 'A balanced breakfast with oats, fresh fruit, and yogurt for sustained energy.', 'Provides fiber, protein, and natural sugars for steady energy', 'Morning', 'Improve Fitness', 'All Ages', 'All Levels', true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.food_recommendations WHERE food_name = 'Oats with Fruit and Yogurt');

INSERT INTO public.food_recommendations (food_name, category, description, benefits, best_time, fitness_goal, age_group, fitness_level, is_published, created_by)
SELECT 'Fruit and Handful of Nuts', 'Snack', 'A simple snack with fresh fruit and a small handful of mixed nuts.', 'Provides healthy fats, vitamins, and natural energy', 'Anytime', 'Stay Active', 'All Ages', 'All Levels', true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.food_recommendations WHERE food_name = 'Fruit and Handful of Nuts');

INSERT INTO public.food_recommendations (food_name, category, description, benefits, best_time, fitness_goal, age_group, fitness_level, is_published, created_by)
SELECT 'Balanced Lunch Plate', 'Lunch', 'Rice or roti with vegetables, dal, and a protein source for a complete meal.', 'Supports muscle recovery and provides sustained energy', 'Afternoon', 'Improve Strength', 'Adults', 'All Levels', true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.food_recommendations WHERE food_name = 'Balanced Lunch Plate');

INSERT INTO public.food_recommendations (food_name, category, description, benefits, best_time, fitness_goal, age_group, fitness_level, is_published, created_by)
SELECT 'Post-Workout Yogurt with Fruit', 'Post-Workout', 'Yogurt with fresh fruit for a balanced post-workout snack.', 'Supports recovery with protein and natural carbohydrates', 'After exercise', 'Improve Strength', 'All Ages', 'All Levels', true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.food_recommendations WHERE food_name = 'Post-Workout Yogurt with Fruit');

INSERT INTO public.food_recommendations (food_name, category, description, benefits, best_time, fitness_goal, age_group, fitness_level, is_published, created_by)
SELECT 'Water Throughout the Day', 'Hydration', 'Stay hydrated by drinking water regularly throughout the day. Aim for 8-10 glasses.', 'Supports overall hydration and physical performance', 'Throughout the day', 'Stay Active', 'All Ages', 'All Levels', true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.food_recommendations WHERE food_name = 'Water Throughout the Day');

INSERT INTO public.food_recommendations (food_name, category, description, benefits, best_time, fitness_goal, age_group, fitness_level, is_published, created_by)
SELECT 'Light Pre-Workout Banana', 'Pre-Workout', 'A banana 30 minutes before exercise for quick natural energy.', 'Provides quick carbohydrates for energy', '30 min before exercise', 'Improve Endurance', 'All Ages', 'All Levels', true, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.food_recommendations WHERE food_name = 'Light Pre-Workout Banana');
