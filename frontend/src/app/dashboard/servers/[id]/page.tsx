'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { serversApi, metricsApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { MetricGauge } from '@/components/metrics/MetricGauge';
import { MetricChart } from '@/components/metrics/MetricChart';
import { cn, getStatusBg, formatUptime, formatBytes } from '@/lib/utils';
import { Server, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ServerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const socket = useSocket();
  const [liveMetrics, setLiveMetrics] = useState<any>(null);

  const { data: server } = useQuery({
    queryKey: ['server', id],
    queryFn: () => serversApi.getById(id).then(r => r.data.data),
  });

  const { data: history } = useQuery({
    queryKey: ['server-history', id],
    queryFn: () => metricsApi.getHistory(id, 6).then(r => r.data.data),
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!socket) return;
    socket.emit('subscribe:server', id);
    socket.on('metrics:update', (data: any) => {
      if (data.serverId === id) setLiveMetrics(data.metrics);
    });
    return () => {
      socket.emit('unsubscribe:server', id);
      socket.off('metrics:update');
    };
  }, [socket, id]);

  const metrics = liveMetrics || server?.metricSnapshots?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/servers" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <Server className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{server?.name ?? 'Loading...'}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">{server?.hostname}</span>
              {server?.status && (
                <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', getStatusBg(server.status))}>
                  {server.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricGauge label="CPU Usage" value={metrics?.cpu} unit="%" warningThreshold={75} criticalThreshold={90} />
        <MetricGauge label="RAM Usage" value={metrics?.ram} unit="%" warningThreshold={80} criticalThreshold={95} />
        <MetricGauge label="Disk Usage" value={metrics?.disk} unit="%" warningThreshold={80} criticalThreshold={90} />
        <MetricGauge label="Load Average" value={metrics?.loadAvg} unit="" warningThreshold={2} criticalThreshold={4} maxValue={8} />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Uptime', value: metrics?.uptime ? formatUptime(metrics.uptime) : '—' },
          { label: 'Network In', value: metrics?.networkIn ? formatBytes(metrics.networkIn) + '/s' : '—' },
          { label: 'Network Out', value: metrics?.networkOut ? formatBytes(metrics.networkOut) + '/s' : '—' },
          { label: 'IP Address', value: server?.ipAddress ?? '—' },
        ].map(item => (
          <div key={item.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-lg font-bold text-foreground mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {history && history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricChart title="CPU History" data={history} dataKey="cpu" color="#3b82f6" unit="%" />
          <MetricChart title="RAM History" data={history} dataKey="ram" color="#8b5cf6" unit="%" />
          <MetricChart title="Disk History" data={history} dataKey="disk" color="#f59e0b" unit="%" />
          <MetricChart title="Load Average" data={history} dataKey="loadAvg" color="#10b981" unit="" />
        </div>
      )}
    </div>
  );
}
