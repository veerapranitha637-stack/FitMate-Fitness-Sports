/*
# FitMate - Sample Data Seed

Inserts demo data for challenges, badges, sports events, and sample leaderboard users.

## Data inserted:
1. 5 sample challenges (Walking, Running, Yoga, Cycling, Family Fitness)
2. 8 achievement badges
3. 6 sample sports events
4. Sample leaderboard entries in a separate table (no FK to auth.users)
*/

-- ===== CHALLENGES =====
INSERT INTO challenges (name, description, challenge_type, activity_type, target_value, duration_days, reward_points, start_date, end_date) VALUES
('7-Day Walking Challenge', 'Walk for at least 20 minutes every day for 7 consecutive days. Perfect for building a daily movement habit!', 'activity', 'Walking', 140, 7, 150, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('5-Day Running Challenge', 'Run for 20 minutes for 5 days. Push your endurance and build cardiovascular strength!', 'activity', 'Running', 100, 5, 200, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days'),
('7-Day Yoga Challenge', 'Complete 15 minutes of yoga for 7 days. Improve flexibility, balance, and mindfulness.', 'activity', 'Yoga', 105, 7, 150, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('Weekend Cycling Challenge', 'Complete 60 minutes of cycling during the weekend. A great way to stay active outdoors!', 'activity', 'Cycling', 60, 2, 120, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days'),
('Family Fitness Challenge', 'Family members collectively complete 300 activity minutes. Get everyone moving together!', 'group', 'Other', 300, 14, 300, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days')
ON CONFLICT DO NOTHING;

-- ===== BADGES =====
INSERT INTO badges (name, description, icon, requirement) VALUES
('First Activity', 'Complete your very first activity', 'Footprints', 'first_activity'),
('3-Day Streak', 'Maintain a 3-day activity streak', 'Flame', 'streak_3'),
('7-Day Streak', 'Maintain a 7-day activity streak', 'Flame', 'streak_7'),
('100 Points', 'Earn 100 total FitPoints', 'Trophy', 'points_100'),
('500 Points', 'Earn 500 total FitPoints', 'Trophy', 'points_500'),
('Goal Completed', 'Complete a fitness goal challenge', 'Target', 'goal_completed'),
('Challenge Completed', 'Complete any challenge', 'Gamepad2', 'challenge_completed'),
('Sports Participant', 'Register for a sports event', 'Activity', 'sports_participant')
ON CONFLICT DO NOTHING;

-- ===== SPORTS EVENTS =====
INSERT INTO sports_events (name, sport, description, event_date, event_time, location, max_participants) VALUES
('Sunday Morning Cricket Match', 'Cricket', 'Friendly 20-over cricket match. All skill levels welcome! Bring your friends for a fun morning of cricket.', CURRENT_DATE + INTERVAL '3 days', '08:00', 'Green Valley Sports Ground, Sector 12', 22),
('City 5K Fun Run', 'Running', 'A community 5K fun run through the city park. Open to all ages and fitness levels. Medals for top finishers!', CURRENT_DATE + INTERVAL '7 days', '06:30', 'Central Park, Main Gate', 200),
('Weekend Football Tournament', 'Football', '5-a-side football tournament. Register as a team or individual. Refreshments provided!', CURRENT_DATE + INTERVAL '10 days', '16:00', 'Sports Arena, MG Road', 40),
('Badminton Championship', 'Badminton', 'Singles and doubles badminton championship. Prizes for winners in each category!', CURRENT_DATE + INTERVAL '14 days', '09:00', 'Indoor Stadium, City Center', 32),
('Cyclists City Ride', 'Cycling', 'A scenic 15km group cycling ride through the city. Great for fitness enthusiasts and nature lovers alike.', CURRENT_DATE + INTERVAL '5 days', '07:00', 'Riverside Park, Gate 3', 50),
('Basketball Showdown', 'Basketball', '3v3 basketball showdown. Fast-paced action and great competition!', CURRENT_DATE + INTERVAL '21 days', '17:00', 'Community Sports Complex', 24)
ON CONFLICT DO NOTHING;

-- ===== LEADERBOARD SAMPLE TABLE =====
CREATE TABLE IF NOT EXISTS leaderboard_sample (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  age_group text NOT NULL,
  fitness_level text NOT NULL,
  total_points integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  weekly_points integer NOT NULL DEFAULT 0,
  is_weekly boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard_sample ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_leaderboard_sample" ON leaderboard_sample;
CREATE POLICY "select_all_leaderboard_sample" ON leaderboard_sample FOR SELECT
  TO authenticated USING (true);

INSERT INTO leaderboard_sample (full_name, age_group, fitness_level, total_points, current_streak, longest_streak, level, weekly_points, is_weekly) VALUES
('Rohan Verma', 'Sports Enthusiast', 'Advanced', 2100, 30, 30, 5, 320, true),
('Sneha Gupta', 'Adult', 'Advanced', 1850, 20, 25, 4, 280, true),
('Arjun Sharma', 'Working Professional', 'Advanced', 1250, 15, 22, 4, 250, true),
('Priya Patel', 'Student', 'Intermediate', 980, 12, 18, 3, 190, true),
('Meera Iyer', 'Adult', 'Intermediate', 650, 7, 14, 3, 150, true),
('Karthik Nair', 'Working Professional', 'Beginner', 420, 5, 8, 2, 80, true),
('Vikram Singh', 'Senior Citizen', 'Beginner', 340, 10, 12, 2, 60, true),
('Ananya Reddy', 'Student', 'Beginner', 180, 3, 5, 2, 40, true)
ON CONFLICT DO NOTHING;
