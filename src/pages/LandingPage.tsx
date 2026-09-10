import { Link } from 'react-router-dom';
import {
  Brain,
  Activity,
  Trophy,
  Zap,
  TrendingUp,
  Calendar,
  Heart,
  Users,
  Briefcase,
  GraduationCap,
  Baby,
  PersonStanding,
  Dumbbell,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function LandingPage() {
  const features = [
    { icon: Brain, title: 'Smart Recommendations', desc: 'Personalized activity plans based on your age, fitness level, goals, and available time.', color: 'bg-primary-100 text-primary-600' },
    { icon: Activity, title: 'Activity Tracking', desc: 'Record your daily activities, earn FitPoints, and watch your progress grow over time.', color: 'bg-secondary-100 text-secondary-600' },
    { icon: Trophy, title: 'Challenges', desc: 'Join exciting fitness challenges, stay motivated, and earn reward points for completion.', color: 'bg-accent-100 text-accent-600' },
    { icon: Zap, title: 'FitPoints', desc: 'Gamified points system with levels and badges to keep you motivated on your journey.', color: 'bg-amber-100 text-amber-600' },
    { icon: TrendingUp, title: 'Leaderboard', desc: 'Compete with friends and the community on global and weekly leaderboards.', color: 'bg-green-100 text-green-600' },
    { icon: Calendar, title: 'Sports Events', desc: 'Discover and register for local sports events — cricket, football, running, and more.', color: 'bg-blue-100 text-blue-600' },
  ];

  const audiences = [
    { icon: Baby, title: 'Children & Teens', desc: 'Fun activities to build healthy habits early' },
    { icon: GraduationCap, title: 'Students', desc: 'Stay active between classes and exams' },
    { icon: Briefcase, title: 'Working Professionals', desc: 'Quick workouts for busy schedules' },
    { icon: Heart, title: 'Adults', desc: 'Maintain fitness and manage weight' },
    { icon: Users, title: 'Families', desc: 'Get everyone moving together' },
    { icon: PersonStanding, title: 'Senior Citizens', desc: 'Gentle, low-impact daily activities' },
    { icon: Dumbbell, title: 'Sports Enthusiasts', desc: 'Train, track, and compete in your sport' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FitMate</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin-login" className="btn-ghost text-sm hidden sm:inline-flex">Admin</Link>
            <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">Login</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Move • Improve • Achieve
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Your Fitness.<br />Your Goals.<br />
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Your FitMate.</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                Personalized fitness recommendations, fun challenges, sports activities and progress tracking — all in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register" className="btn-primary flex items-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="btn-secondary">Login</Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500" /> Free to use
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary-500" /> For all ages
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent-500" /> No equipment needed
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-3xl blur-3xl opacity-30" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="card p-6 card-hover animate-slide-up">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">1,250</p>
                  <p className="text-sm text-gray-500">FitPoints earned</p>
                </div>
                <div className="card p-6 card-hover mt-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center mb-3">
                    <Zap className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">7 days</p>
                  <p className="text-sm text-gray-500">Active streak</p>
                </div>
                <div className="card p-6 card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="w-12 h-12 rounded-xl bg-secondary-100 text-secondary-600 flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-500">Activities this week</p>
                </div>
                <div className="card p-6 card-hover mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">Level 4</p>
                  <p className="text-sm text-gray-500">Fitness Champion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything you need to stay fit</h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">Smart tools that make fitness fun, motivating, and personalized for you.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <div key={idx} className="card p-6 card-hover animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Everyone */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-primary-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Fitness for Everyone</h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">No matter your age or lifestyle, FitMate has something for you.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {audiences.map((a, idx) => (
              <div key={idx} className="card p-5 text-center card-hover animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center mx-auto mb-3">
                  <a.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{a.title}</h3>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-10 bg-gradient-to-br from-primary-600 to-primary-700 border-0">
            <h2 className="text-3xl font-bold text-white mb-3">Ready to start your fitness journey?</h2>
            <p className="text-primary-100 mb-6">Join FitMate today and get personalized recommendations instantly.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-all active:scale-95">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800">FitMate</span>
            <span className="text-sm text-gray-400">— Move • Improve • Achieve</span>
          </div>
          <p className="text-sm text-gray-400">
            Smart India Hackathon 2026 Prototype
          </p>
        </div>
      </footer>
    </div>
  );
}
