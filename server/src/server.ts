import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { connectDB } from './database/connection';
import { initSocket } from './sockets/leaderboardSocket';
import authRoutes from './routes/authRoutes';
import scoreRoutes from './routes/scoreRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
const PORT = Number(process.env.PORT) || 3001;

async function main() {
  await connectDB();

  const app = express();
  const httpServer = createServer(app);

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/scores', scoreRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);

  // Health check
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // Serve client in production (single-deploy option)
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  // Socket.IO
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
