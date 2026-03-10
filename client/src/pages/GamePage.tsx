import React from 'react';
import { GameCanvas } from '../components/game/GameCanvas';
import type { UserData } from '../types/user';

interface GamePageProps {
  user: UserData;
  onGameOver: (score: number) => void;
  onAbort: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({ user, onGameOver, onAbort }) => (
  <div className="min-h-dvh bg-sky-bg flex flex-col items-center justify-center p-2 sm:p-4">
    <div className="w-full max-w-md mb-2 sm:mb-3 flex justify-between items-center px-1">
      <button
        onClick={onAbort}
        className="text-text-dark/60 hover:text-text-dark transition-colors text-sm font-semibold"
      >
        ← Back
      </button>
      <div className="text-xs tracking-wider text-text-dark/40 font-semibold uppercase">
        Competitive Match
      </div>
    </div>
    <GameCanvas onGameOver={onGameOver} currentBest={user.bestScore} />
  </div>
);
