import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Calendar, Users, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/Common';
import type { SportsEvent, SportCategory } from '@/types';

const SPORT_OPTIONS: SportCategory[] = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Volleyball', 'Running', 'Cycling', 'Swimming', 'Other'];
const STATUS_OPTIONS = ['upcoming', 'ongoing', 'completed', 'cancelled'] as const;

export function AdminEventsPage() {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SportsEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<SportsEvent | null>(null);
  const [participants, setParticipants] = useState<{ full_name: string; email: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '', sport: 'Cricket' as SportCategory, description: '',
    event_date: '', event_time: '09:00', location: '', max_participants: '50',
    registration_deadline: '', status: 'upcoming' as typeof STATUS_OPTIONS[number],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('sports_events').select('*').order('event_date', { ascending: false });
    setEvents((data ?? []) as SportsEvent[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const openCreate = () => {
    setEditingEvent(null);
    setFormData({ name: '', sport: 'Cricket', description: '', event_date: '', event_time: '09:00', location: '', max_participants: '50', registration_deadline: '', status: 'upcoming' });
    setShowModal(true);
  };

  const openEdit = (event: SportsEvent) => {
    setEditingEvent(event);
    setFormData({
      name: event.name, sport: event.sport, description: event.description ?? '',
      event_date: event.event_date, event_time: event.event_time, location: event.location,
      max_participants: String(event.max_participants),
      registration_deadline: event.registration_deadline ?? '',
      status: event.status ?? 'upcoming',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!formData.name.trim() || !formData.event_date || !formData.location.trim()) {
      setError('Name, date, and location are required');
      return;
    }
    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      sport: formData.sport,
      description: formData.description.trim() || null,
      event_date: formData.event_date,
      event_time: formData.event_time,
      location: formData.location.trim(),
      max_participants: parseInt(formData.max_participants, 10) || 50,
      registration_deadline: formData.registration_deadline || null,
      status: formData.status,
    };

    if (editingEvent) {
      await supabase.from('sports_events').update(payload).eq('id', editingEvent.id);
    } else {
      await supabase.from('sports_events').insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    await fetchEvents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    await supabase.from('sports_events').delete().eq('id', id);
    await fetchEvents();
  };

  const handleView = async (event: SportsEvent) => {
    setViewingEvent(event);
    const { data: regs } = await supabase.from('event_registrations').select('user_id').eq('event_id', event.id);
    if (regs && regs.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('full_name, email').in('id', regs.map((r) => r.user_id));
      setParticipants((profiles ?? []) as { full_name: string; email: string }[]);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Sports Events</h1>
          <p className="text-gray-500 mt-1">Create, edit, and manage sports events</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="card p-4 animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-pill bg-primary-100 text-primary-700">{event.sport}</span>
                    <span className={`badge-pill ${event.status === 'upcoming' ? 'bg-green-100 text-green-700' : event.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>{event.status}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{event.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.event_date} {event.event_time}</span>
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleView(event)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(event)} className="p-2 rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(event.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No events yet. Create your first event!</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <input className="input-field" placeholder="Event Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <select className="input-field" value={formData.sport} onChange={(e) => setFormData({ ...formData, sport: e.target.value as SportCategory })}>
                {SPORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea className="input-field resize-none" rows={2} placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="input-field" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} />
                <input type="time" className="input-field" value={formData.event_time} onChange={(e) => setFormData({ ...formData, event_time: e.target.value })} />
              </div>
              <input className="input-field" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="input-field" placeholder="Max Participants" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })} />
                <input type="date" className="input-field" placeholder="Reg. Deadline" value={formData.registration_deadline} onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })} />
              </div>
              <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof STATUS_OPTIONS[number] })}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                {saving ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />Saving...</span> : editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Participants Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewingEvent(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">Registered Participants</h2>
              <button onClick={() => setViewingEvent(null)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-3">{viewingEvent.name}</p>
              {participants.length > 0 ? (
                <div className="space-y-2">
                  {participants.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
                        {p.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{p.full_name}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No registrations yet.</p>
                </div>
              )}
              <p className="text-sm font-medium text-gray-600 mt-3">{participants.length} / {viewingEvent.max_participants} registered</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
