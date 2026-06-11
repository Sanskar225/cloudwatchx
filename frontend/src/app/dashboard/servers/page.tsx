'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serversApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn, getStatusBg, formatRelativeTime } from '@/lib/utils';
import { Plus, Server, Search, RefreshCw, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { AddServerModal } from '@/components/servers/AddServerModal';
import Link from 'next/link';

export default function ServersPage() {
  const { isAdmin } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: servers, isLoading, refetch } = useQuery({
    queryKey: ['servers'],
    queryFn: () => serversApi.getAll().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: serversApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['servers'] }); toast.success('Server removed'); },
    onError: () => toast.error('Failed to remove server'),
  });

  const filtered = servers?.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.hostname.toLowerCase().includes(search.toLowerCase()) ||
    s.ipAddress.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Servers</h1>
          <p className="text-muted-foreground text-sm mt-1">{servers?.length ?? 0} servers monitored</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin() && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Add Server
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search servers..."
          className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Name', 'Hostname / IP', 'Group', 'Tags', 'Status', 'Last Seen', ''].map(h => (
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
            ) : filtered?.map((server: any) => (
              <tr key={server.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{server.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div>
                    <p className="text-sm text-foreground">{server.hostname}</p>
                    <p className="text-xs text-muted-foreground font-mono">{server.ipAddress}</p>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-muted-foreground">{server.group || '—'}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {server.tags?.map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-accent border border-border rounded-full text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(server.status))}>
                    {server.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs text-muted-foreground">
                    {server.lastSeen ? formatRelativeTime(server.lastSeen) : 'Never'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/dashboard/servers/${server.id}`}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    {isAdmin() && (
                      <button onClick={() => deleteMutation.mutate(server.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No servers found</div>
        )}
      </div>

      {showAdd && <AddServerModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
