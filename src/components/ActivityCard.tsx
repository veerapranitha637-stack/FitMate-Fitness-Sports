import { Activity as ActivityIcon, Clock, MapPin, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import type { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
}

const activityColors: Record<string, string> = {
  Walking: 'bg-green-100 text-green-600',
  Running: 'bg-orange-100 text-orange-600',
  Cycling: 'bg-teal-100 text-teal-600',
  Yoga: 'bg-purple-100 text-purple-600',
  Gym: 'bg-red-100 text-red-600',
  Badminton: 'bg-blue-100 text-blue-600',
  Football: 'bg-emerald-100 text-emerald-600',
  Cricket: 'bg-indigo-100 text-indigo-600',
  Swimming: 'bg-cyan-100 text-cyan-600',
  Other: 'bg-gray-100 text-gray-600',
};

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="card p-4 card-hover animate-slide-in flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${activityColors[activity.activity_type] ?? activityColors.Other}`}>
        <ActivityIcon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-gray-800 truncate">{activity.activity_type}</h4>
          <span className="badge-pill bg-accent-50 text-accent-600 flex-shrink-0">
            +{activity.points} pts
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {activity.duration_minutes} min
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(activity.activity_date)}
          </span>
          {activity.distance != null && activity.distance > 0 && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {activity.distance} km
            </span>
          )}
        </div>
        {activity.notes && <p className="text-xs text-gray-400 mt-1 truncate">{activity.notes}</p>}
      </div>
    </div>
  );
}
