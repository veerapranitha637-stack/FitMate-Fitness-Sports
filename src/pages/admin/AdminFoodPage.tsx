import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Search, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';
import type { FoodRecommendation } from '@/types';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout', 'Hydration'];
const FITNESS_GOALS = ['Stay Active', 'Improve Fitness', 'Improve Strength', 'Improve Flexibility', 'Improve Endurance', 'Weight Management'];
const AGE_GROUPS = ['Children', 'Teenagers', 'Young Adults', 'Adults', 'Senior Citizens', 'All Ages'];
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export function AdminFoodPage() {
  const [items, setItems] = useState<FoodRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FoodRecommendation | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    food_name: '', category: 'Snack', description: '', benefits: '', best_time: 'Anytime',
    fitness_goal: 'Stay Active', age_group: 'All Ages', fitness_level: 'All Levels',
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('food_recommendations').select('*').order('created_at', { ascending: false });
    setItems((data ?? []) as FoodRecommendation[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter((item) => {
    const matchesSearch = item.food_name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openCreate = () => {
    setEditing(null);
    setFormData({
      food_name: '', category: 'Snack', description: '', benefits: '', best_time: 'Anytime',
      fitness_goal: 'Stay Active', age_group: 'All Ages', fitness_level: 'All Levels',
    });
    setShowModal(true);
  };

  const openEdit = (item: FoodRecommendation) => {
    setEditing(item);
    setFormData({
      food_name: item.food_name, category: item.category, description: item.description,
      benefits: item.benefits, best_time: item.best_time, fitness_goal: item.fitness_goal,
      age_group: item.age_group, fitness_level: item.fitness_level,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!formData.food_name.trim() || !formData.description.trim()) {
      setError('Food name and description are required');
      return;
    }
    setSaving(true);
    const payload = {
      food_name: formData.food_name.trim(),
      category: formData.category,
      description: formData.description.trim(),
      benefits: formData.benefits.trim(),
      best_time: formData.best_time.trim(),
      fitness_goal: formData.fitness_goal,
      age_group: formData.age_group,
      fitness_level: formData.fitness_level,
    };
    if (editing) {
      await supabase.from('food_recommendations').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('food_recommendations').insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food recommendation?')) return;
    await supabase.from('food_recommendations').delete().eq('id', id);
    await fetchItems();
  };

  const togglePublish = async (item: FoodRecommendation) => {
    await supabase.from('food_recommendations').update({ is_published: !item.is_published }).eq('id', item.id);
    await fetchItems();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Food &amp; Nutrition</h1>
          <p className="text-gray-500 mt-1">Manage food recommendations for users</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Food
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search food recommendations..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    <span className="badge-pill bg-secondary-100 text-secondary-700">{item.fitness_goal}</span>
                    <span className={`badge-pill ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{item.food_name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>{item.best_time}</span>
                    <span>{item.age_group}</span>
                    <span>{item.fitness_level}</span>
                  </div>
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
          <p className="text-gray-500">No food recommendations found. Create your first one!</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Food Recommendation' : 'Add Food Recommendation'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <input className="input-field" placeholder="Food name" value={formData.food_name} onChange={(e) => setFormData({ ...formData, food_name: e.target.value })} />
              <select className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea className="input-field resize-none" rows={2} placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <textarea className="input-field resize-none" rows={2} placeholder="Benefits" value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} />
              <input className="input-field" placeholder="Best time (e.g., Morning, Anytime)" value={formData.best_time} onChange={(e) => setFormData({ ...formData, best_time: e.target.value })} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select className="input-field" value={formData.fitness_goal} onChange={(e) => setFormData({ ...formData, fitness_goal: e.target.value })}>
                  {FITNESS_GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <select className="input-field" value={formData.age_group} onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}>
                  {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <select className="input-field" value={formData.fitness_level} onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value })}>
                  {FITNESS_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                {saving ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />Saving...</span> : editing ? 'Update Recommendation' : 'Create Recommendation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
