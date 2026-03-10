import { io, type Socket } from 'socket.io-client';
import type { LeaderboardEntry } from '../types/user';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_API_URL || window.location.origin, {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
}

export function onLeaderboardUpdate(callback: (data: LeaderboardEntry[]) => void): () => void {
  const s = connectSocket();
  s.on('leaderboard:update', callback);
  return () => {
    s.off('leaderboard:update', callback);
  };
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
