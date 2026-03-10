import { useState, useEffect, useCallback } from 'react';
import type { UserData, LeaderboardEntry } from './types/user';
import { api } from './services/api';
import { connectSocket, onLeaderboardUpdate, disconnectSocket } from './services/socket';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { GamePage } from './pages/GamePage';

type View = 'login' | 'dashboard' | 'game';

export default function App() {
  const [view, setView] = useState<View>(api.isLoggedIn() ? 'dashboard' : 'login');
  const [user, setUser] = useState<UserData | null>(null);
  const [allTimeBoard, setAllTimeBoard] = useState<LeaderboardEntry[]>([]);
  const [weeklyBoard, setWeeklyBoard] = useState<LeaderboardEntry[]>([]);
  const [recentScore, setRecentScore] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [loading, setLoading] = useState(api.isLoggedIn());

  // Restore session from token
  useEffect(() => {
    if (!api.isLoggedIn()) return;
    api
      .getMe()
      .then((u) => {
        setUser(u);
        setView('dashboard');
      })
      .catch(() => {
        api.logout();
        setView('login');
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch leaderboards and connect socket
  useEffect(() => {
    if (!user) return;

    api.getAllTimeLeaderboard().then(setAllTimeBoard).catch(console.error);
    api.getWeeklyLeaderboard().then(setWeeklyBoard).catch(console.error);

    connectSocket();
    const unsub = onLeaderboardUpdate((data) => {
      setAllTimeBoard(data);
      // Also refresh weekly
      api.getWeeklyLeaderboard().then(setWeeklyBoard).catch(console.error);
    });

    return () => {
      unsub();
      disconnectSocket();
    };
  }, [user]);

  const handleLogin = useCallback((userData: UserData) => {
    setUser(userData);
    setView('dashboard');
  }, []);

  const handleGameOver = useCallback(
    async (score: number) => {
      setRecentScore(score);
      if (!user) return;

      try {
        const result = await api.submitScore(score);
        setIsNewBest(result.newBest);
        if (result.newBest) {
          setUser((prev) => (prev ? { ...prev, bestScore: result.bestScore } : null));
        }
      } catch (err) {
        console.error('Score submit failed:', err);
      }
      setView('dashboard');
    },
    [user],
  );

  const handleLogout = useCallback(() => {
    api.logout();
    setUser(null);
    setView('login');
    setRecentScore(null);
    disconnectSocket();
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh bg-sky-bg flex items-center justify-center">
        <div className="text-white text-xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (view === 'game' && user) {
    return (
      <GamePage
        user={user}
        onGameOver={handleGameOver}
        onAbort={() => setView('dashboard')}
      />
    );
  }

  if (!user) return null;

  return (
    <DashboardPage
      user={user}
      allTimeBoard={allTimeBoard}
      weeklyBoard={weeklyBoard}
      recentScore={recentScore}
      isNewBest={isNewBest}
      onPlay={() => setView('game')}
      onLogout={handleLogout}
    />
  );
}
