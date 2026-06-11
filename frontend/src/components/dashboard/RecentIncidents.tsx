import { cn, getStatusBg, formatRelativeTime } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function RecentIncidents({ incidents }: { incidents?: any[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <h3 className="font-semibold text-foreground">Active Incidents</h3>
        </div>
        <Link href="/dashboard/incidents" className="text-xs text-primary hover:underline">View all</Link>
      </div>
      <div className="space-y-2">
        {incidents?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">🎉 No active incidents</p>
        )}
        {incidents?.map((incident) => (
          <Link key={incident.id} href={`/dashboard/incidents`}
            className="flex items-start gap-3 py-2 border-b border-border last:border-0 hover:bg-accent/30 rounded px-2 -mx-2 transition-colors">
            <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 mt-0.5', getStatusBg(incident.severity))}>
              {incident.severity}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{incident.title}</p>
              <p className="text-xs text-muted-foreground">{incident.server?.name} · {formatRelativeTime(incident.createdAt)}</p>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium shrink-0', getStatusBg(incident.status))}>
              {incident.status}
            </span>
          </Link>
        )) ?? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-accent/50 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
