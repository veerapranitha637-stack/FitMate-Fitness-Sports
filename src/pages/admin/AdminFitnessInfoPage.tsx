import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Search, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';
import type { FitnessInformation } from '@/types';

const CATEGORIES = ['Walking', 'Running', 'Cycling', 'Yoga', 'Gym', 'Badminton', 'Football', 'Swimming', 'Strength', 'Flexibility', 'Endurance', 'General Fitness'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export function AdminFitnessInfoPage() {
  const [items, setItems] = useState<FitnessInformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FitnessInformation | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '', category: 'General Fitness', description: '', difficulty: 'Beginner', duration_minutes: '30',
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('fitness_information').select('*').order('created_at', { ascending: false });
    setItems((data ?? []) as FitnessInformation[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openCreate = () => {
    setEditing(null);
    setFormData({ title: '', category: 'General Fitness', description: '', difficulty: 'Beginner', duration_minutes: '30' });
    setShowModal(true);
  };

  const openEdit = (item: FitnessInformation) => {
    setEditing(item);
    setFormData({
      title: item.title, category: item.category, description: item.description,
      difficulty: item.difficulty, duration_minutes: String(item.duration_minutes),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }
    setSaving(true);
    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim(),
      difficulty: formData.difficulty,
      duration_minutes: parseInt(formData.duration_minutes, 10) || 30,
    };
    if (editing) {
      await supabase.from('fitness_information').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('fitness_information').insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fitness information?')) return;
    await supabase.from('fitness_information').delete().eq('id', id);
    await fetchItems();
  };

  const togglePublish = async (item: FitnessInformation) => {
    await supabase.from('fitness_information').update({ is_published: !item.is_published }).eq('id', item.id);
    await fetchItems();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fitness Information</h1>
          <p className="text-gray-500 mt-1">Create and manage fitness tips for users</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Information
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search fitness tips..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-48" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="card p-4 animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="badge-pill bg-primary-100 text-primary-700">{item.category}</span>
                    <span className="badge-pill bg-secondary-100 text-secondary-700">{item.difficulty}</span>
                    <span className="text-xs text-gray-400">{item.duration_minutes} min</span>
                    <span className={`badge-pill ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => togglePublish(item)} className={`p-2 rounded-lg ${item.is_published ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {item.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No fitness information found. Create your first one!</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Information' : 'Add Information'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <input className="input-field" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <select className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea className="input-field resize-none" rows={3} placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="number" className="input-field" placeholder="Duration (min)" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} />
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                {saving ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />Saving...</span> : editing ? 'Update Information' : 'Create Information'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
