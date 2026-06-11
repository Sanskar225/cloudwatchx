import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    HEALTHY: 'text-emerald-400',
    WARNING: 'text-yellow-400',
    CRITICAL: 'text-red-400',
    OFFLINE: 'text-gray-500',
    UNKNOWN: 'text-gray-400',
    OPEN: 'text-red-400',
    INVESTIGATING: 'text-yellow-400',
    RESOLVED: 'text-emerald-400',
    ACTIVE: 'text-red-400',
    ACKNOWLEDGED: 'text-yellow-400',
    INFO: 'text-blue-400',
  };
  return map[status] || 'text-gray-400';
}

export function getStatusBg(status: string): string {
  const map: Record<string, string> = {
    HEALTHY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    WARNING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
    OFFLINE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    UNKNOWN: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    OPEN: 'bg-red-500/10 text-red-400 border-red-500/20',
    INVESTIGATING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    INFO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ACTIVE: 'bg-red-500/10 text-red-400 border-red-500/20',
    ACKNOWLEDGED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };
  return map[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
}
