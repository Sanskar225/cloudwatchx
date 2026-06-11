'use client';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { FileText, User, Server, Zap, AlertTriangle } from 'lucide-react';

const actionIcons: Record<string, any> = {
  LOGIN: User, CREATE_SERVER: Server, DELETE_SERVER: Server,
  UPDATE_SERVER: Server, CREATE_RULE: Zap, DELETE_RULE: Zap,
  UPDATE_RULE: Zap, UPDATE_INCIDENT: AlertTriangle,
};

const actionColors: Record<string, string> = {
  LOGIN: 'text-blue-400', CREATE_SERVER: 'text-emerald-400',
  DELETE_SERVER: 'text-red-400', CREATE_RULE: 'text-yellow-400',
  UPDATE_INCIDENT: 'text-orange-400',
};

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditApi.getAll().then(r => r.data.data),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">System activity history</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Action', 'User', 'Resource', 'Details', 'IP Address', 'Time'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-3"><div className="h-4 bg-accent rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : logs?.map((log: any) => {
              const Icon = actionIcons[log.action] ?? FileText;
              const color = actionColors[log.action] ?? 'text-muted-foreground';
              return (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                      <span className={`text-xs font-mono font-medium ${color}`}>{log.action}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm text-foreground">{log.user?.name ?? 'System'}</p>
                      <p className="text-xs text-muted-foreground">{log.user?.email ?? ''}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-muted-foreground">{log.resource}</span>
                  </td>
                  <td className="px-5 py-3 max-w-xs">
                    <span className="text-xs text-muted-foreground truncate block">
                      {log.details ? JSON.stringify(log.details).slice(0, 60) : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-muted-foreground">{log.ipAddress ?? '—'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(log.createdAt)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && logs?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No audit logs yet</div>
        )}
      </div>
    </div>
  );
}
