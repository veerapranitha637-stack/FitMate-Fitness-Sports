import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Megaphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/helpers';
import type { Announcement } from '@/types';

const ANNOUNCEMENT_TYPES = ['general', 'event', 'challenge', 'update', 'urgent'];

export function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', type: 'general' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements((data ?? []) as Announcement[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleSave = async () => {
    setError('');
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Title and message are required');
      return;
    }
    setSaving(true);
    await supabase.from('announcements').insert({
      title: formData.title.trim(),
      message: formData.message.trim(),
      type: formData.type,
      created_by: user?.id,
    });
    setSaving(false);
    setShowModal(false);
    setFormData({ title: '', message: '', type: 'general' });
    await fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    await fetchAnnouncements();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  const typeColors: Record<string, string> = {
    general: 'bg-blue-100 text-blue-700',
    event: 'bg-green-100 text-green-700',
    challenge: 'bg-amber-100 text-amber-700',
    update: 'bg-secondary-100 text-secondary-700',
    urgent: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Announcements</h1>
          <p className="text-gray-500 mt-1">Send announcements to all users</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="card p-4 animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge-pill ${typeColors[a.type] ?? typeColors.general}`}>{a.type}</span>
                    <span className="text-xs text-gray-400">{formatDate(a.created_at)}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{a.message}</p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No announcements yet. Create your first one!</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">New Announcement</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <input className="input-field" placeholder="Title (e.g., New Badminton Tournament!)" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="input-field resize-none" rows={3} placeholder="Message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                {ANNOUNCEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                {saving ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />Publishing...</span> : 'Publish Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
