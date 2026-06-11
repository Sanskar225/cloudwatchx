'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Settings, Bell, Shield, Link, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, isAdmin } = useAuthStore();
  const [notifications, setNotifications] = useState({
    slack: process.env.NEXT_PUBLIC_SLACK_ENABLED === 'true',
    discord: false,
    email: false,
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform configuration</p>
      </div>

      {/* Profile */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Profile</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role },
            { label: 'User ID', value: user?.id },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
              <p className="text-sm text-foreground bg-accent border border-border rounded-lg px-3 py-2 font-mono">
                {f.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations */}
      {isAdmin() && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Notification Integrations</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Configure via environment variables: SLACK_WEBHOOK_URL, DISCORD_WEBHOOK_URL, SMTP_HOST
          </p>
          <div className="space-y-3">
            {[
              { key: 'slack', label: 'Slack', desc: 'SLACK_WEBHOOK_URL' },
              { key: 'discord', label: 'Discord', desc: 'DISCORD_WEBHOOK_URL' },
              { key: 'email', label: 'Email (SMTP)', desc: 'SMTP_HOST + SMTP_USER + SMTP_PASS' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground font-mono">{desc}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${(notifications as any)[key] ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External links */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Link className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Monitoring Stack</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Grafana', url: `http://localhost:3001`, desc: 'Dashboards & visualization' },
            { label: 'Prometheus', url: `http://localhost:9090`, desc: 'Metrics & alerting rules' },
            { label: 'Alertmanager', url: `http://localhost:9093`, desc: 'Alert routing' },
            { label: 'Node Exporter', url: `http://localhost:9100/metrics`, desc: 'Host metrics' },
          ].map(({ label, url, desc }) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors group">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">About CloudWatchX</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[['Version', 'v1.0.0'], ['Stack', 'Next.js + Node.js + PostgreSQL'], ['License', 'MIT']].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="text-foreground">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
