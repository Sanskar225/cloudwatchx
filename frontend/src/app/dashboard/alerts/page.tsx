'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn, getStatusBg, formatRelativeTime } from '@/lib/utils';
import { Bell, CheckCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const LEVELS = ['ALL', 'CRITICAL', 'WARNING', 'INFO'];
const STATUSES = ['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'];

export default function AlertsPage() {
  const { isAdmin } = useAuthStore();
  const qc = useQueryClient();
  const [level, setLevel] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', level, status],
    queryFn: () => alertsApi.getAll({
      ...(level !== 'ALL' && { level }),
      ...(status !== 'ALL' && { status }),
    }).then(r => r.data.data),
    refetchInterval: 20000,
  });

  const ackMutation = useMutation({
    mutationFn: alertsApi.acknowledge,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alerts'] }); toast.success('Alert acknowledged'); },
  });

  const resolveMutation = useMutation({
    mutationFn: alertsApi.resolve,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alerts'] }); toast.success('Alert resolved'); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
        <p className="text-muted-foreground text-sm mt-1">{alerts?.length ?? 0} alerts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={cn('px-3 py-1 rounded text-xs font-medium transition-colors',
                level === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={cn('px-3 py-1 rounded text-xs font-medium transition-colors',
                status === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          ))
        ) : alerts?.map((alert: any) => (
          <div key={alert.id}
            className={cn('bg-card border rounded-xl px-5 py-4 flex items-start gap-4',
              alert.level === 'CRITICAL' ? 'border-red-500/30' : alert.level === 'WARNING' ? 'border-yellow-500/30' : 'border-border')}>
            <div className="mt-0.5">
              <Bell className={cn('w-4 h-4',
                alert.level === 'CRITICAL' ? 'text-red-400' : alert.level === 'WARNING' ? 'text-yellow-400' : 'text-blue-400')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">{alert.title}</span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(alert.level))}>{alert.level}</span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(alert.status))}>{alert.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {alert.server && <span>{alert.server.name}</span>}
                {alert.metric && <span>{alert.metric}: {alert.value?.toFixed(2)}</span>}
                <span>{formatRelativeTime(alert.createdAt)}</span>
              </div>
            </div>
            {isAdmin() && alert.status === 'ACTIVE' && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => ackMutation.mutate(alert.id)}
                  className="p-1.5 text-muted-foreground hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors" title="Acknowledge">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => resolveMutation.mutate(alert.id)}
                  className="p-1.5 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" title="Resolve">
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
        {!isLoading && alerts?.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No alerts found</div>
        )}
      </div>
    </div>
  );
}
