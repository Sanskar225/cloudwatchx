'use client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { StatCard } from '@/components/dashboard/StatCard';
import { ServiceHealth } from '@/components/dashboard/ServiceHealth';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { RecentIncidents } from '@/components/dashboard/RecentIncidents';
import { Server, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';

export default function DashboardPage() {
  const socket = useSocket();
  const [liveStats, setLiveStats] = useState<any>(null);

  const { data: overview, refetch } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardApi.overview().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data: serviceHealth } = useQuery({
    queryKey: ['service-health'],
    queryFn: () => dashboardApi.serviceHealth().then(r => r.data.data),
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!socket) return;
    socket.on('metrics:overview', () => refetch());
    socket.on('incident:new', () => refetch());
    socket.on('alert:new', () => refetch());
    return () => {
      socket.off('metrics:overview');
      socket.off('incident:new');
      socket.off('alert:new');
    };
  }, [socket, refetch]);

  const stats = liveStats || overview?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Infrastructure Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time monitoring dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Servers"
          value={stats?.totalServers ?? '—'}
          icon={Server}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <StatCard
          title="Healthy Servers"
          value={stats?.healthyServers ?? '—'}
          icon={CheckCircle}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
          trend={stats?.totalServers ? `${Math.round((stats.healthyServers / stats.totalServers) * 100)}% healthy` : undefined}
          trendUp
        />
        <StatCard
          title="Critical Servers"
          value={stats?.criticalServers ?? '—'}
          icon={XCircle}
          iconColor="text-red-400"
          iconBg="bg-red-500/10"
          alert={stats?.criticalServers > 0}
        />
        <StatCard
          title="Active Incidents"
          value={stats?.activeIncidents ?? '—'}
          icon={AlertTriangle}
          iconColor="text-yellow-400"
          iconBg="bg-yellow-500/10"
          alert={stats?.activeIncidents > 0}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentIncidents incidents={overview?.recentIncidents} />
          <RecentAlerts alerts={overview?.recentAlerts} />
        </div>
        <div>
          <ServiceHealth services={serviceHealth} />
        </div>
      </div>
    </div>
  );
}
