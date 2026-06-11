'use client';
import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '@/lib/api';
import { MetricGauge } from '@/components/metrics/MetricGauge';
import { cn, getStatusBg } from '@/lib/utils';
import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function MetricsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['metrics-overview'],
    queryFn: () => metricsApi.overview().then(r => r.data.data),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Metrics</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time infrastructure metrics</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {data?.map(({ server, metrics }: any) => (
            <div key={server.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-primary" />
                  <div>
                    <Link href={`/dashboard/servers/${server.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                      {server.name}
                    </Link>
                    <span className={cn('ml-2 text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(server.status))}>
                      {server.status}
                    </span>
                  </div>
                </div>
                <Link href={`/dashboard/servers/${server.id}`} className="text-xs text-primary hover:underline">
                  View details →
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricGauge label="CPU" value={metrics?.cpu} unit="%" warningThreshold={75} criticalThreshold={90} />
                <MetricGauge label="RAM" value={metrics?.ram} unit="%" warningThreshold={80} criticalThreshold={95} />
                <MetricGauge label="Disk" value={metrics?.disk} unit="%" warningThreshold={80} criticalThreshold={90} />
                <MetricGauge label="Load Avg" value={metrics?.loadAvg} unit="" warningThreshold={2} criticalThreshold={4} maxValue={8} />
              </div>
            </div>
          ))}
          {data?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No metrics available. Add servers to start monitoring.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
