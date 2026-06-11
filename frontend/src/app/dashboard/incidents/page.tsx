'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn, getStatusBg, formatRelativeTime } from '@/lib/utils';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { IncidentDetailModal } from '@/components/incidents/IncidentDetailModal';

const STATUSES = ['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'];
const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function IncidentsPage() {
  const { isAdmin } = useAuthStore();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', statusFilter, severityFilter],
    queryFn: () => incidentsApi.getAll({
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(severityFilter !== 'ALL' && { severity: severityFilter }),
    }).then(r => r.data),
    refetchInterval: 20000,
  });

  const { data: stats } = useQuery({
    queryKey: ['incident-stats'],
    queryFn: () => incidentsApi.getStats().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => incidentsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); toast.success('Incident updated'); },
  });

  const incidents = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incidents</h1>
        <p className="text-muted-foreground text-sm mt-1">Incident management and tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open', value: stats?.open ?? 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Investigating', value: stats?.investigating ?? 0, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Resolved', value: stats?.resolved ?? 0, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', s.bg)}>
              <s.icon className={cn('w-5 h-5', s.color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1 rounded text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {SEVERITIES.map(s => (
            <button key={s} onClick={() => setSeverityFilter(s)}
              className={cn('px-3 py-1 rounded text-xs font-medium transition-colors',
                severityFilter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Title', 'Server', 'Severity', 'Status', 'Assigned', 'Created', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-3"><div className="h-4 bg-accent rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : incidents.map((inc: any) => (
              <tr key={inc.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => setSelected(inc)}>
                <td className="px-5 py-3 max-w-xs">
                  <p className="text-sm font-medium text-foreground truncate">{inc.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{inc.description}</p>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-muted-foreground">{inc.server?.name}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(inc.severity))}>
                    {inc.severity}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(inc.status))}>
                    {inc.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs text-muted-foreground">{inc.assignedTo?.name ?? '—'}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(inc.createdAt)}</span>
                </td>
                <td className="px-5 py-3">
                  {isAdmin() && inc.status !== 'RESOLVED' && (
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      {inc.status === 'OPEN' && (
                        <button onClick={() => updateMutation.mutate({ id: inc.id, data: { status: 'INVESTIGATING' } })}
                          className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded hover:bg-yellow-500/20 transition-colors">
                          Investigate
                        </button>
                      )}
                      <button onClick={() => updateMutation.mutate({ id: inc.id, data: { status: 'RESOLVED' } })}
                        className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors">
                        Resolve
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && incidents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No incidents found</div>
        )}
      </div>

      {selected && (
        <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
