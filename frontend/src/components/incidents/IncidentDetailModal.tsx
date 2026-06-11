'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '@/lib/api';
import { cn, getStatusBg, formatRelativeTime } from '@/lib/utils';
import { X, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export function IncidentDetailModal({ incident, onClose }: { incident: any; onClose: () => void }) {
  const { isAdmin } = useAuthStore();
  const qc = useQueryClient();
  const [note, setNote] = useState('');

  const { data } = useQuery({
    queryKey: ['incident-detail', incident.id],
    queryFn: () => incidentsApi.getById(incident.id).then(r => r.data.data),
  });

  const timelineMutation = useMutation({
    mutationFn: (msg: string) => incidentsApi.addTimeline(incident.id, msg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incident-detail', incident.id] });
      setNote('');
      toast.success('Note added');
    },
  });

  const inc = data ?? incident;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">{inc.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(inc.severity))}>{inc.severity}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(inc.status))}>{inc.status}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground text-xs">Server</p><p className="text-foreground">{inc.server?.name}</p></div>
            <div><p className="text-muted-foreground text-xs">Assigned To</p><p className="text-foreground">{inc.assignedTo?.name ?? 'Unassigned'}</p></div>
            <div><p className="text-muted-foreground text-xs">Created</p><p className="text-foreground">{formatRelativeTime(inc.createdAt)}</p></div>
            {inc.resolvedAt && <div><p className="text-muted-foreground text-xs">Resolved</p><p className="text-foreground">{formatRelativeTime(inc.resolvedAt)}</p></div>}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground bg-accent/50 rounded-lg p-3">{inc.description}</p>
          </div>

          {/* Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {inc.timeline?.length === 0 && (
                <p className="text-xs text-muted-foreground">No timeline entries yet</p>
              )}
              {inc.timeline?.map((entry: any) => (
                <div key={entry.id} className="flex gap-3 text-xs">
                  <span className="text-muted-foreground shrink-0 mt-0.5">{formatRelativeTime(entry.createdAt)}</span>
                  <p className="text-foreground">{entry.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add note */}
          {isAdmin() && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Add Note</h3>
              </div>
              <div className="flex gap-2">
                <input value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Add a timeline note..."
                  className="flex-1 bg-accent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <button onClick={() => note.trim() && timelineMutation.mutate(note)}
                  disabled={!note.trim() || timelineMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-1">
                  {timelineMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
