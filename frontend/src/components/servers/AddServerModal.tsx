'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serversApi } from '@/lib/api';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AddServerModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', hostname: '', ipAddress: '', port: '9100', group: '', tags: '' });

  const mutation = useMutation({
    mutationFn: (data: any) => serversApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['servers'] });
      toast.success('Server added successfully');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to add server'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      port: parseInt(form.port),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Add Server</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {[
            { label: 'Server Name', key: 'name', placeholder: 'Production API' },
            { label: 'Hostname', key: 'hostname', placeholder: 'prod-api-01.example.com' },
            { label: 'IP Address', key: 'ipAddress', placeholder: '10.0.1.10' },
            { label: 'Node Exporter Port', key: 'port', placeholder: '9100' },
            { label: 'Group', key: 'group', placeholder: 'Production' },
            { label: 'Tags (comma separated)', key: 'tags', placeholder: 'api, production, aws' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-foreground mb-1">{f.label}</label>
              <input
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required={['name', 'hostname', 'ipAddress'].includes(f.key)}
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add Server
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
