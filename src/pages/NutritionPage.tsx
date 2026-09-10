import { useState, useEffect } from 'react';
import { Apple, Coffee, Sun, Moon, Utensils, Droplets, Dumbbell, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/Common';
import type { FoodRecommendation, Profile } from '@/types';

const CATEGORY_ICONS: Record<string, typeof Apple> = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
  Snack: Apple,
  'Pre-Workout': Dumbbell,
  'Post-Workout': Utensils,
  Hydration: Droplets,
};

export function NutritionPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<FoodRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('food_recommendations')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      setItems((data ?? []) as FoodRecommendation[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  const p = profile as Profile | null;
  const userGoal = p?.fitness_goal ?? 'Stay Active';
  const userAgeGroup = p?.age_group ?? 'Adults';
  const userLevel = p?.fitness_level ?? 'Beginner';

  const matchesProfile = (item: FoodRecommendation) => {
    const goalMatch = item.fitness_goal === userGoal || item.fitness_goal === 'Stay Active';
    const ageMatch = item.age_group === userAgeGroup || item.age_group === 'All Ages';
    const levelMatch = item.fitness_level === userLevel || item.fitness_level === 'All Levels';
    return goalMatch && ageMatch && levelMatch;
  };

  const personalized = items.filter(matchesProfile);
  const otherItems = items.filter((item) => !matchesProfile(item));
  const displayList = filterCategory === 'All' ? [...personalized, ...otherItems] : items.filter((i) => i.category === filterCategory);
  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <Apple className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nutrition &amp; Food</h1>
            <p className="text-gray-500 text-sm">General wellness suggestions tailored to your profile</p>
          </div>
        </div>
      </div>

      {p && (
        <div className="card p-4 bg-gradient-to-r from-green-50 to-primary-50 border-green-200">
          <p className="text-sm text-gray-600">
            Showing recommendations for: <span className="font-semibold text-gray-800">{userGoal}</span> · <span className="font-semibold text-gray-800">{userAgeGroup}</span> · <span className="font-semibold text-gray-800">{userLevel}</span>
          </p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filterCategory === cat ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {displayList.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {displayList.map((item) => {
            const Icon = CATEGORY_ICONS[item.category] ?? Apple;
            const isPersonalized = personalized.includes(item);
            return (
              <div key={item.id} className={`card p-5 animate-slide-up ${isPersonalized ? 'ring-2 ring-green-300' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isPersonalized ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="badge-pill bg-primary-100 text-primary-700">{item.category}</span>
                      {isPersonalized && <span className="badge-pill bg-green-100 text-green-700">For You</span>}
                    </div>
                    <h3 className="font-bold text-gray-900">{item.food_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    {item.benefits && (
                      <p className="text-xs text-gray-400 mt-2"><span className="font-medium text-gray-500">Benefits:</span> {item.benefits}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                      <span>Best: {item.best_time}</span>
                      <span>{item.fitness_goal}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Apple className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No food recommendations available yet. Check back soon!</p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center max-w-md mx-auto">
        These are general wellness and fitness suggestions, not medical advice. Consult a healthcare professional for specific dietary needs.
      </p>
    </div>
  );
}
