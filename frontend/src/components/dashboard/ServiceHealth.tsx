import { cn, getStatusBg } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface Service {
  name: string;
  status: string;
  url?: string;
}

export function ServiceHealth({ services }: { services?: Service[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">Service Health</h3>
      </div>
      <div className="space-y-2">
        {services?.map((svc) => (
          <div key={svc.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-foreground">{svc.name}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(svc.status))}>
              {svc.status}
            </span>
          </div>
        )) ?? (
          <div className="space-y-2">
            {['Backend API', 'Database', 'Redis', 'Prometheus', 'Grafana'].map(name => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{name}</span>
                <div className="w-16 h-4 bg-accent rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
