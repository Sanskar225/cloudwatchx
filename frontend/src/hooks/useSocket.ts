'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store';

let socket: Socket | null = null;

export const useSocket = () => {
  const { accessToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
        auth: { token: accessToken },
        transports: ['websocket'],
      });
    }

    socketRef.current = socket;

    return () => {
      // Keep socket alive across page navigation
    };
  }, [accessToken]);

  return socketRef.current;
};

export const getSocket = () => socket;
