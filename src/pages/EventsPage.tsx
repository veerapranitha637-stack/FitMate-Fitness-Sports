import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { EventCard } from '@/components/EventCard';
import { LoadingSpinner } from '@/components/ui/Common';
import { SPORT_CATEGORIES } from '@/config/fitpoints';
import { formatDate, formatTime } from '@/utils/helpers';
import type { SportsEvent, EventRegistration, SportCategory } from '@/types';

export function EventsPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SportCategory | 'All'>('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailEvent, setDetailEvent] = useState<SportsEvent | null>(null);

  const fetchData = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: eventsData } = await supabase
      .from('sports_events')
      .select('*')
      .order('event_date', { ascending: true });
    setEvents(eventsData as SportsEvent[] ?? []);

    // Get registration counts for all events
    const countsMap: Record<string, number> = {};
    await Promise.all(
      (eventsData ?? []).map(async (e) => {
        const { count } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', e.id);
        countsMap[e.id] = count ?? 0;
      }),
    );
    setRegistrationCounts(countsMap);

    // Get user's registrations
    if (user) {
      const { data: regData } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', user.id);
      setRegistrations(regData as EventRegistration[] ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRegister = async (eventId: string) => {
    if (!user || !isSupabaseConfigured) return;
    setActionLoading(eventId);
    await supabase.from('event_registrations').insert({
      event_id: eventId,
      user_id: user.id,
    });
    await fetchData();
    setActionLoading(null);
  };

  const handleCancel = async (eventId: string) => {
    if (!user || !isSupabaseConfigured) return;
    setActionLoading(eventId);
    await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);
    await fetchData();
    setActionLoading(null);
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
          <Calendar className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your profile first</h2>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary mt-2">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  const filtered = filter === 'All' ? events : events.filter((e) => e.sport === filter);
  const userEventIds = new Set(registrations.map((r) => r.event_id));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sports Events</h1>
        <p className="text-gray-500 mt-1">Discover and register for local sports events</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('All')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'All' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Sports
        </button>
        {SPORT_CATEGORIES.map((sport) => (
          <button
            key={sport}
            onClick={() => setFilter(sport)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === sport ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Events */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner label="Loading events..." />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              registeredCount={registrationCounts[event.id] ?? 0}
              isRegistered={userEventIds.has(event.id)}
              onRegister={() => handleRegister(event.id)}
              onCancel={() => handleCancel(event.id)}
              onViewDetails={() => setDetailEvent(event)}
              loading={actionLoading === event.id}
            />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No events found for this category.</p>
        </div>
      )}

      {/* Detail Modal */}
      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setDetailEvent(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Event Details</h2>
              <button onClick={() => setDetailEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="text-xl font-bold text-gray-900">{detailEvent.name}</h3>
              <span className="badge-pill bg-primary-100 text-primary-700">{detailEvent.sport}</span>
              {detailEvent.description && <p className="text-sm text-gray-600">{detailEvent.description}</p>}
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Date:</span> {formatDate(detailEvent.event_date)}</p>
                <p><span className="font-medium">Time:</span> {formatTime(detailEvent.event_time)}</p>
                <p><span className="font-medium">Location:</span> {detailEvent.location}</p>
                <p><span className="font-medium">Capacity:</span> {registrationCounts[detailEvent.id] ?? 0} / {detailEvent.max_participants}</p>
              </div>
              <div className="flex gap-2 pt-2">
                {userEventIds.has(detailEvent.id) ? (
                  <button
                    onClick={() => { handleCancel(detailEvent.id); setDetailEvent(null); }}
                    className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                  >
                    Cancel Registration
                  </button>
                ) : (
                  <button
                    onClick={() => { handleRegister(detailEvent.id); setDetailEvent(null); }}
                    className="btn-primary flex-1 text-sm"
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
