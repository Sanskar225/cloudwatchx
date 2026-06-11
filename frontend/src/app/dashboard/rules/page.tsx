'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rulesApi } from '@/lib/api';
import { cn, getStatusBg } from '@/lib/utils';
import { Plus, Trash2, Zap, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const METRICS = ['cpu', 'ram', 'disk', 'load_avg', 'network_in', 'network_out'];
const OPERATORS = ['>', '>=', '<', '<=', '=='];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function RulesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', metric: 'cpu', operator: '>', threshold: '80', severity: 'HIGH' });

  const { data: rules, isLoading } = useQuery({
    queryKey: ['rules'],
    queryFn: () => rulesApi.getAll().then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: rulesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rules'] }); toast.success('Rule created'); setShowForm(false); },
    onError: () => toast.error('Failed to create rule'),
  });

  const deleteMutation = useMutation({
    mutationFn: rulesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rules'] }); toast.success('Rule deleted'); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => rulesApi.update(id, { enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rules'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, threshold: parseFloat(form.threshold) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitoring Rules</h1>
          <p className="text-muted-foreground text-sm mt-1">Automated alerting thresholds</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      {/* Create Rule Form */}
      {showForm && (
        <div className="bg-card border border-primary/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Create Rule</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Rule name" required
              className="lg:col-span-2 bg-accent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <select value={form.metric} onChange={e => setForm(p => ({ ...p, metric: e.target.value }))}
              className="bg-accent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={form.operator} onChange={e => setForm(p => ({ ...p, operator: e.target.value }))}
              className="bg-accent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <input type="number" value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))}
              placeholder="Threshold" required
              className="bg-accent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
              className="bg-accent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="submit" disabled={createMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
              {createMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Create
            </button>
          </form>
        </div>
      )}

      {/* Rules table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Rule Name', 'Condition', 'Severity', 'Server', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-3"><div className="h-4 bg-accent rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : rules?.map((rule: any) => (
              <tr key={rule.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">{rule.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="font-mono text-sm text-foreground bg-accent px-2 py-0.5 rounded">
                    {rule.metric} {rule.operator} {rule.threshold}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(rule.severity))}>
                    {rule.severity}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-muted-foreground">{rule.server?.name ?? 'All servers'}</span>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleMutation.mutate({ id: rule.id, enabled: !rule.enabled })}
                    className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      rule.enabled ? 'bg-primary' : 'bg-muted')}>
                    <span className={cn('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                      rule.enabled ? 'translate-x-4' : 'translate-x-1')} />
                  </button>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => deleteMutation.mutate(rule.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && rules?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No rules defined. Create your first rule.</div>
        )}
      </div>
    </div>
  );
}
