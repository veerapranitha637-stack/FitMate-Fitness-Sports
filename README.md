# FitMate – Smart Fitness & Sports Platform

**Move • Improve • Achieve**

FitMate is an intelligent, gamified fitness and sports platform built for the Smart India Hackathon 2026. It supports all age groups — children, students, professionals, adults, families, senior citizens, and sports enthusiasts — with personalized activity recommendations, challenges, leaderboards, and progress tracking.

## Tech Stack

- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Backend/Database/Auth:** Supabase
- **Build Tool:** Vite

## Installation

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Build

```bash
npm run build      # production build
npm run typecheck  # type checking only
```

## Supabase Configuration

Supabase is pre-configured with environment variables in `.env`:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If these are present, the app uses real Supabase authentication and database. If missing, the app enters demo mode with a notice.

### Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User fitness profiles (level, points, streak, preferences) |
| `activities` | Activity logs (type, duration, points, date) |
| `challenges` | Challenge definitions (target, reward, duration) |
| `challenge_participants` | User challenge joins and progress |
| `badges` | Badge definitions |
| `user_badges` | Earned badges per user |
| `groups` | Community/family groups |
| `group_members` | Group membership |
| `sports_events` | Sports event listings |
| `event_registrations` | User event registrations |
| `notifications` | User notifications |
| `group_challenges` | Group-level fitness challenges with auto-progress |
| `leaderboard_sample` | Sample leaderboard demo data |

All tables have Row Level Security (RLS) enabled. Users can only modify their own data. Public content (challenges, events, badges) is readable by all authenticated users.

## Optional AI Configuration

To enable AI-powered recommendations, set this environment variable:

```
VITE_AI_API_KEY=your-api-key
```

Without this key, the app uses the built-in **rule-based recommendation engine**. The architecture in `src/services/recommendationEngine.ts` is ready to connect to an AI API.

## Main Features

1. **Landing Page** – Hero, feature cards, "Fitness for Everyone" sections
2. **Authentication** – Login, Register, Forgot Password (Supabase Auth)
3. **Fitness Profile** – Age group, fitness level, goal, preferred activities, available time
4. **Dashboard** – Greeting, daily motivation, stat cards, level progress, recent activities
5. **Smart Recommendations** – Rule-based personalized activity plans with warm-up, main activity, and cool-down phases
6. **Activity Tracking** – Log activities, earn FitPoints, auto-update streaks and stats
7. **Streak System** – Daily consecutive activity tracking with motivational messages
8. **FitPoints & Levels** – 5 levels (Beginner → Fitness Master), 8 achievement badges auto-unlocked
9. **Challenges** – 5 sample challenges with auto-progress tracking when activities are logged
10. **Leaderboard** – Global, Weekly, and Friends tabs with sample users
11. **Community & Group Challenges** – Create/join groups (Family, Friends, Community, Sports Team), view group statistics (total FitPoints, activity minutes, active members), create group challenges with target minutes, group leaderboard with member rankings, motivational messages (e.g., "Your family is 75% toward the goal!"), automatic progress updates when any member logs an activity
12. **Sports Events** – Browse, register, and cancel registration for local events
13. **Progress Dashboard** – Charts: weekly minutes, activity types, cumulative points, challenge completion
14. **FitAI Assistant** – Chat-based fitness guidance with predefined responses (AI-ready architecture)
15. **Settings** – Notification preferences, browser notification permission, account info, logout
16. **Responsive Navigation** – Desktop sidebar + mobile bottom nav

## How the Recommendation Engine Works

The engine in `src/services/recommendationEngine.ts` considers:
- Age group (adjusts activity intensity and types)
- Fitness level (Beginner/Intermediate/Advanced — adjusts warm-up/cool-down ratios)
- Fitness goal (provides goal-specific tips)
- Preferred activities (selects user's preferred activity)
- Available time (structures the plan duration)
- Recent activities (adjusts intensity based on recent activity frequency)

It generates a structured plan with phases (warm-up, main activity, cool-down), estimated FitPoints, and fitness tips.

## FitPoints Configuration

Points per minute are configured in `src/config/fitpoints.ts`:

| Activity | Points/Minute |
|---|---|
| Walking | 1 |
| Running | 2 |
| Cycling | 2 |
| Yoga | 1 |
| Gym | 2 |
| Badminton | 2 |
| Football | 2 |
| Cricket | 2 |
| Swimming | 2 |
| Other | 1 |

## Level Thresholds

| Level | Name | Points Required |
|---|---|---|
| 1 | Beginner | 0 |
| 2 | Active | 100 |
| 3 | Fitness Explorer | 500 |
| 4 | Fitness Champion | 1,000 |
| 5 | Fitness Master | 2,000 |

## Project Structure

```
src/
  components/     Reusable UI components (StatCard, ActivityCard, ChallengeCard, etc.)
  pages/          Page components (Dashboard, Login, Challenges, etc.)
  layouts/        App layout with sidebar and mobile nav
  services/       Recommendation engine
  hooks/          Custom hooks (useAuth, useActivities, useChallenges)
  utils/          Helper functions
  types/          TypeScript types
  config/         FitPoints config, levels, constants
  lib/            Supabase client
```

## How to Demonstrate

1. **Register** a new account (or login if you have one)
2. **Complete your Fitness Profile** — select age group, level, goal, activities, time
3. **Dashboard** shows your personalized greeting and stats
4. Click **"Get My Recommendation"** to see a personalized activity plan
5. **Log an Activity** — watch FitPoints increase and streak update
6. **Join a Challenge** — progress updates automatically when you log matching activities
7. **Leaderboard** — see your ranking against sample users
8. **Progress** — view charts of your weekly activity, points over time, and activity types
9. **FitAI** — ask fitness questions and get instant guidance
10. **Community** — create a group, join a group, add a group challenge (e.g., "Family 300-Minute Challenge"), log an activity and verify group challenge progress updates, view the group leaderboard
11. **Sports Events** — register for an event
12. **Settings** — configure notifications and logout

## Disclaimer

FitMate provides general fitness guidance and wellness suggestions only. It does not provide medical diagnosis, treatment advice, or medication recommendations. Always consult a healthcare professional for specific health concerns.
