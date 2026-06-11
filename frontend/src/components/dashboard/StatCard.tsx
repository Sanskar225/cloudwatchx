import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
  alert?: boolean;
}

export function StatCard({ title, value, icon: Icon, iconColor, iconBg, trend, trendUp, alert }: StatCardProps) {
  return (
    <div className={cn(
      'bg-card border rounded-xl p-5 transition-colors',
      alert ? 'border-red-500/30' : 'border-border'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn('text-3xl font-bold mt-1', alert ? 'text-red-400' : 'text-foreground')}>
            {value}
          </p>
          {trend && (
            <p className={cn('text-xs mt-1', trendUp ? 'text-emerald-400' : 'text-red-400')}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}
