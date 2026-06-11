import { cn, getStatusBg, formatRelativeTime } from '@/lib/utils';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export function RecentAlerts({ alerts }: { alerts?: any[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Recent Alerts</h3>
        </div>
        <Link href="/dashboard/alerts" className="text-xs text-primary hover:underline">View all</Link>
      </div>
      <div className="space-y-2">
        {alerts?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
        )}
        {alerts?.slice(0, 6).map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
            <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 mt-0.5', getStatusBg(alert.level))}>
              {alert.level}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.server?.name} · {formatRelativeTime(alert.createdAt)}</p>
            </div>
          </div>
        )) ?? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-accent/50 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
