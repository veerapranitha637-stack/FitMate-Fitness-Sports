import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'warning';
  trend?: string;
}

const colorStyles = {
  primary: 'bg-primary-50 text-primary-600',
  secondary: 'bg-secondary-50 text-secondary-600',
  accent: 'bg-accent-50 text-accent-600',
  warning: 'bg-amber-50 text-amber-600',
};

export function StatCard({ icon: Icon, label, value, subtitle, color = 'primary', trend }: StatCardProps) {
  return (
    <div className="card p-5 card-hover animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colorStyles[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className="text-xs font-medium text-primary-600">{trend}</span>
        </div>
      )}
    </div>
  );
}
