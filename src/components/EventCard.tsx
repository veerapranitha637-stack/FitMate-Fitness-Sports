import { Calendar, MapPin, Users, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/helpers';
import type { SportsEvent } from '@/types';

interface EventCardProps {
  event: SportsEvent;
  registeredCount: number;
  isRegistered: boolean;
  onRegister?: () => void;
  onCancel?: () => void;
  onViewDetails?: () => void;
  loading?: boolean;
}

export function EventCard({
  event,
  registeredCount,
  isRegistered,
  onRegister,
  onCancel,
  onViewDetails,
  loading,
}: EventCardProps) {
  const spotsLeft = event.max_participants - registeredCount;
  const isFull = spotsLeft <= 0;

  const sportColors: Record<string, string> = {
    Cricket: 'bg-blue-100 text-blue-600',
    Football: 'bg-green-100 text-green-600',
    Badminton: 'bg-purple-100 text-purple-600',
    Running: 'bg-orange-100 text-orange-600',
    Cycling: 'bg-teal-100 text-teal-600',
    Basketball: 'bg-red-100 text-red-600',
    Volleyball: 'bg-yellow-100 text-yellow-600',
    Other: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="card overflow-hidden card-hover animate-slide-up">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className={`badge-pill ${sportColors[event.sport] ?? sportColors.Other}`}>
            {event.sport}
          </span>
          {isRegistered && (
            <span className="badge-pill bg-primary-100 text-primary-700">
              <CheckCircle2 className="w-3 h-3" />
              Registered
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.name}</h3>
        {event.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(event.event_date)}
            <Clock className="w-4 h-4 text-gray-400 ml-2" />
            {formatTime(event.event_time)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            {event.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            {registeredCount} / {event.max_participants} registered
            {spotsLeft > 0 && spotsLeft <= 5 && (
              <span className="text-xs text-accent-600 font-medium">Only {spotsLeft} spots left!</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {onViewDetails && (
            <button onClick={onViewDetails} className="btn-ghost flex-1 text-sm">
              View Details
            </button>
          )}
          {isRegistered ? (
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Cancelling...' : 'Cancel Registration'}
            </button>
          ) : (
            <button
              onClick={onRegister}
              disabled={loading || isFull}
              className="btn-primary flex-1 text-sm"
            >
              {loading ? 'Registering...' : isFull ? 'Event Full' : 'Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
