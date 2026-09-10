import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function AdminSettingsPage() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-500 mt-1">Manage your admin account</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{profile?.full_name ?? 'Admin'}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <span className="badge-pill bg-gray-100 text-gray-600 mt-1">Admin / Event Organizer</span>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Info className="w-4 h-4" /> Admin Information</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>As an admin, you can manage sports events, challenges, announcements, users, and sport categories.</p>
          <p>Changes you make (events, challenges) appear instantly for all users.</p>
          <p>Announcements are visible on the user dashboard.</p>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="w-full text-sm font-semibold px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" /> Sign Out of Admin Account
      </button>
    </div>
  );
}
