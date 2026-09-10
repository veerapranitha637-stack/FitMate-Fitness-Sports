import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Bell,
  Smartphone,
  Save,
  Check,
  Heart,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/Common';

export function SettingsPage() {
  const navigate = useNavigate();
  const { profile, signOut, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    challengeReminder: true,
    streakReminder: true,
    eventReminder: true,
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('FitMate Notifications Enabled!', {
          body: 'You\'ll now receive reminders to stay active.',
        });
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Store notification preferences — for the prototype, we use localStorage
    localStorage.setItem('fitmate_notifications', JSON.stringify(notifications));
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-8">
        <div className="card p-8 text-center">
          <SettingsIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your profile first</h2>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary mt-2">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  const toggles = [
    { key: 'dailyReminder' as const, label: 'Daily Activity Reminder', desc: 'Get reminded to log your daily activity' },
    { key: 'challengeReminder' as const, label: 'Challenge Reminder', desc: 'Notifications about challenge progress and deadlines' },
    { key: 'streakReminder' as const, label: 'Streak Reminder', desc: "Don't break your streak — get daily reminders" },
    { key: 'eventReminder' as const, label: 'Sports Event Reminder', desc: 'Updates about events you\'ve registered for' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your notification preferences and account</p>
      </div>

      {/* Notification Settings */}
      <div className="card p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
        </div>

        {/* Browser notification permission */}
        <div className="mb-5 p-4 rounded-xl bg-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">Browser Notifications</p>
              <p className="text-xs text-gray-500">
                {notificationPermission === 'granted'
                  ? 'Notifications are enabled. You\'ll receive reminders in your browser.'
                  : notificationPermission === 'denied'
                    ? 'Notifications are blocked. Please enable them in your browser settings.'
                    : 'Enable browser notifications to receive activity reminders.'}
              </p>
            </div>
          </div>
          {notificationPermission !== 'granted' && notificationPermission !== 'denied' && (
            <button onClick={handleRequestPermission} className="btn-secondary text-sm w-full">
              Enable Notifications
            </button>
          )}
        </div>

        {/* Toggle switches */}
        <div className="space-y-3">
          {toggles.map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-1 mr-4">
                <p className="text-sm font-medium text-gray-700">{toggle.label}</p>
                <p className="text-xs text-gray-500">{toggle.desc}</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [toggle.key]: !prev[toggle.key] }))}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  notifications[toggle.key] ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={notifications[toggle.key]}
                aria-label={toggle.label}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifications[toggle.key] ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>

      {/* Account Info */}
      <div className="card p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900">Account</h2>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-800">{profile.full_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-800">{profile.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Age Group</span>
            <span className="font-medium text-gray-800">{profile.age_group}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Member Since</span>
            <span className="font-medium text-gray-800">
              {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
