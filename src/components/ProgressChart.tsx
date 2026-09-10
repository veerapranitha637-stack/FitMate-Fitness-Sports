import type { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface ProgressChartProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ProgressChart({ title, children, className, action }: ProgressChartProps) {
  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
