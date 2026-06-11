'use client';
import { useEffect, useState } from 'react';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';

export function TopBar() {
  const socket = useSocket();
  const [connected, setConnected] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('alert:new', (alert: any) => {
      setAlertCount((c) => c + 1);
      toast.error(`🚨 ${alert.title}`, { duration: 6000 });
    });
    socket.on('incident:new', (incident: any) => {
      toast.error(`⚠️ New Incident: ${incident.title}`, { duration: 6000 });
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('alert:new');
      socket.off('incident:new');
    };
  }, [socket]);

  return (
    <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground font-mono">
          {time.toLocaleTimeString()}
        </span>
        <div className="relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
              {alertCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {connected ? (
            <><Wifi className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400">Live</span></>
          ) : (
            <><WifiOff className="w-3.5 h-3.5 text-red-400" /><span className="text-xs text-red-400">Offline</span></>
          )}
        </div>
      </div>
    </header>
  );
}
