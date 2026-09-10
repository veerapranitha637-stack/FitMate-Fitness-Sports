import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Activity, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';
import { useAuth } from '@/hooks/useAuth';
import type { SportCategoryItem } from '@/types';

export function AdminSportsPage() {
  const { user } = useAuth();
  const [sports, setSports] = useState<SportCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SportCategoryItem | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSports = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('sports_categories').select('*').order('name', { ascending: true });
    setSports((data ?? []) as SportCategoryItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSports(); }, [fetchSports]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setShowModal(true);
  };

  const openEdit = (sport: SportCategoryItem) => {
    setEditing(sport);
    setName(sport.name);
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('Sport name is required');
      return;
    }
    setSaving(true);
    if (editing) {
      await supabase.from('sports_categories').update({ name: name.trim() }).eq('id', editing.id);
    } else {
      await supabase.from('sports_categories').insert({ name: name.trim(), icon: 'Activity', created_by: user?.id });
    }
    setSaving(false);
    setShowModal(false);
    await fetchSports();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this sport category?')) return;
    await supabase.from('sports_categories').delete().eq('id', id);
    await fetchSports();
  };

  const toggleActive = async (sport: SportCategoryItem) => {
    await supabase.from('sports_categories').update({ is_active: !sport.is_active }).eq('id', sport.id);
    await fetchSports();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Sports</h1>
          <p className="text-gray-500 mt-1">Add, edit, or remove sport categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Sport
        </button>
      </div>

      {sports.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {sports.map((sport) => (
            <div key={sport.id} className="card p-4 flex items-center justify-between animate-slide-up">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sport.is_active ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{sport.name}</p>
                  <button
                    onClick={() => toggleActive(sport)}
                    className={`text-xs ${sport.is_active ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {sport.is_active ? 'Active' : 'Inactive'} — click to toggle
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(sport)} className="p-2 rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(sport.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No sport categories yet. Add your first one!</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Sport' : 'Add Sport'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <input className="input-field" placeholder="Sport name (e.g., Basketball)" value={name} onChange={(e) => setName(e.target.value)} />
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                {saving ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />Saving...</span> : editing ? 'Update Sport' : 'Add Sport'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
