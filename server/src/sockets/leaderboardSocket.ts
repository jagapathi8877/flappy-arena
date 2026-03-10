import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { User } from '../models/User';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export async function emitLeaderboardUpdate(): Promise<void> {
  if (!io) return;

  const users = await User.find()
    .sort({ bestScore: -1, rollNumber: 1 })
    .select('rollNumber name bestScore')
    .lean();

  const leaderboard = users.map((u) => ({
    id: u._id,
    rollNumber: u.rollNumber,
    name: u.name,
    bestScore: u.bestScore,
  }));

  io.emit('leaderboard:update', leaderboard);
}
