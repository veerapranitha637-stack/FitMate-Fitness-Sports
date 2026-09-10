import { useState, useEffect } from 'react';
import { BookOpen, Clock, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';
import type { FitnessInformation } from '@/types';

export function FitnessTipsPage() {
  const [items, setItems] = useState<FitnessInformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('fitness_information')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      setItems((data ?? []) as FitnessInformation[]);
      setLoading(false);
    })();
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fitness Tips</h1>
            <p className="text-gray-500 text-sm">Expert fitness information to guide your journey</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search fitness tips..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-48" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="card p-5 animate-slide-up">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="badge-pill bg-primary-100 text-primary-700">{item.category}</span>
                <span className="badge-pill bg-secondary-100 text-secondary-700">{item.difficulty}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.description}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.duration_minutes} minutes</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No fitness tips available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
