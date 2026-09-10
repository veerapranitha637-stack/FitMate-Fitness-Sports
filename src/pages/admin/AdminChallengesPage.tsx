import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Trophy, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';
import type { Challenge, ActivityType } from '@/types';

const ACTIVITY_TYPES: ActivityType[] = ['Walking', 'Running', 'Cycling', 'Yoga', 'Gym', 'Badminton', 'Football', 'Cricket', 'Swimming', 'Other'];

export function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [viewingChallenge, setViewingChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<{ full_name: string; progress: number; completed: boolean }[]>([]);
  const [formData, setFormData] = useState({
    name: '', description: '', challenge_type: 'minutes', activity_type: 'Walking' as ActivityType,
    target_value: '300', duration_days: '7', reward_points: '100', start_date: '', end_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });
    setChallenges((data ?? []) as Challenge[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const openCreate = () => {
    setEditingChallenge(null);
    setFormData({ name: '', description: '', challenge_type: 'minutes', activity_type: 'Walking', target_value: '300', duration_days: '7', reward_points: '100', start_date: new Date().toISOString().split('T')[0], end_date: '' });
    setShowModal(true);
  };

  const openEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      name: challenge.name, description: challenge.description, challenge_type: challenge.challenge_type,
      activity_type: challenge.activity_type, target_value: String(challenge.target_value),
      duration_days: String(challenge.duration_days), reward_points: String(challenge.reward_points),
      start_date: challenge.start_date, end_date: challenge.end_date ?? '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!formData.name.trim() || !formData.start_date) {
      setError('Name and start date are required');
      return;
    }
    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      challenge_type: formData.challenge_type,
      activity_type: formData.activity_type,
      target_value: parseInt(formData.target_value, 10) || 300,
      duration_days: parseInt(formData.duration_days, 10) || 7,
      reward_points: parseInt(formData.reward_points, 10) || 100,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
    };

    if (editingChallenge) {
      await supabase.from('challenges').update(payload).eq('id', editingChallenge.id);
    } else {
      await supabase.from('challenges').insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    await fetchChallenges();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this challenge?')) return;
    await supabase.from('challenges').delete().eq('id', id);
    await fetchChallenges();
  };

  const handleView = async (challenge: Challenge) => {
    setViewingChallenge(challenge);
    const { data: parts } = await supabase.from('challenge_participants').select('user_id, progress, completed').eq('challenge_id', challenge.id);
    if (parts && parts.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('full_name').in('id', parts.map((p) => p.user_id));
      const profileMap = new Map((profiles ?? []).map((p, i) => [parts[i]?.user_id, (p as { full_name: string }).full_name]));
      setParticipants(parts.map((p) => ({ full_name: profileMap.get(p.user_id) ?? 'Unknown', progress: p.progress, completed: p.completed })));
    } else {
      setParticipants([]);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Challenges</h1>
          <p className="text-gray-500 mt-1">Create and manage fitness challenges for users</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Create Challenge
        </button>
      </div>

      {challenges.length > 0 ? (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="card p-4 animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-pill bg-secondary-100 text-secondary-700">{challenge.activity_type}</span>
                    <span className="badge-pill bg-accent-100 text-accent-700">+{challenge.reward_points} pts</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{challenge.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{challenge.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>Target: {challenge.target_value} {challenge.challenge_type}</span>
                    <span>{challenge.duration_days} days</span>
                    <span>Starts: {challenge.start_date}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleView(challenge)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(challenge)} className="p-2 rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(challenge.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No challenges yet. Create your first challenge!</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">{editingChallenge ? 'Edit Challenge' : 'Create Challenge'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <input className="input-field" placeholder="Challenge Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <textarea className="input-field resize-none" rows={2} placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <select className="input-field" value={formData.activity_type} onChange={(e) => setFormData({ ...formData, activity_type: e.target.value as ActivityType })}>
                {ACTIVITY_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" className="input-field" placeholder="Target" value={formData.target_value} onChange={(e) => setFormData({ ...formData, target_value: e.target.value })} />
                <input type="number" className="input-field" placeholder="Days" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })} />
                <input type="number" className="input-field" placeholder="Reward pts" value={formData.reward_points} onChange={(e) => setFormData({ ...formData, reward_points: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="input-field" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                <input type="date" className="input-field" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                {saving ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />Saving...</span> : editingChallenge ? 'Update Challenge' : 'Create Challenge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewingChallenge(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">Participants</h2>
              <button onClick={() => setViewingChallenge(null)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-3">{viewingChallenge.name}</p>
              {participants.length > 0 ? (
                <div className="space-y-2">
                  {participants.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <span className="text-sm font-semibold text-gray-800">{p.full_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{p.progress}/{viewingChallenge.target_value}</span>
                        {p.completed && <span className="badge-pill bg-green-100 text-green-700 text-xs">Done</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">No participants yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
