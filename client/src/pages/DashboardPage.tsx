import React from 'react';
import { Play, LogOut } from 'lucide-react';
import type { UserData, LeaderboardEntry } from '../types/user';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';

interface DashboardPageProps {
  user: UserData;
  allTimeBoard: LeaderboardEntry[];
  weeklyBoard: LeaderboardEntry[];
  recentScore: number | null;
  isNewBest: boolean;
  onPlay: () => void;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  allTimeBoard,
  weeklyBoard,
  recentScore,
  isNewBest,
  onPlay,
  onLogout,
}) => {
  return (
    <div className="min-h-dvh bg-sky-bg p-3 sm:p-4 md:p-8 pb-24 sm:pb-24">
      {/* Decorative ground */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-ground pointer-events-none z-0" />
      <div className="fixed bottom-16 left-0 right-0 h-3 bg-pipe-dark pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 relative z-10">
        {/* Left — Player Card */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-text-dark">{user.name}</h2>
                <p className="text-text-dark/50 font-mono text-sm">{user.rollNumber}</p>
              </div>
              <Button variant="danger" onClick={onLogout} className="p-2 rounded-lg">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-sky-bg/40 rounded-xl p-4 border border-card-border text-center mb-6">
              <div className="text-text-dark/50 text-xs font-bold uppercase tracking-wider mb-1">
                Personal Best
              </div>
              <div className="text-2xl sm:text-3xl font-black text-bird-orange">
                {user.bestScore}
              </div>
            </div>

            {recentScore !== null && (
              <div
                className={`mb-5 p-4 rounded-xl border text-center ${
                  isNewBest
                    ? 'bg-bird-yellow/20 border-bird-yellow'
                    : 'bg-sky-bg/30 border-card-border'
                }`}
              >
                <div className="text-sm text-text-dark/60">Last Run</div>
                <div className="text-2xl font-bold text-text-dark">{recentScore}</div>
                {isNewBest && (
                  <div className="text-xs font-bold text-pipe-green animate-pulse uppercase tracking-widest mt-1">
                    🎉 New Personal Best!
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={onPlay}
              className="w-full py-3 sm:py-4 text-lg sm:text-xl tracking-wider"
            >
              <Play className="w-6 h-6 fill-current mr-2" /> PLAY NOW
            </Button>
          </Card>
        </div>

        {/* Right — Leaderboard */}
        <div className="lg:col-span-8">
          <LeaderboardTable
            allTimeBoard={allTimeBoard}
            weeklyBoard={weeklyBoard}
            currentRollNumber={user.rollNumber}
          />
        </div>
      </div>
    </div>
  );
};
