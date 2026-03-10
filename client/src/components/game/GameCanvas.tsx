import React, { useRef, useState, useCallback } from 'react';
import { useGameEngine } from './useGameEngine';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  currentBest: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, currentBest }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  useGameEngine({
    canvasRef,
    onGameOver,
    onScoreChange: handleScoreChange,
  });

  return (
    <div className="relative w-full aspect-[2/3] max-w-md mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-sky-bg">
      {/* HUD overlay with best score */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-4 z-10 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-center shadow">
          <div className="text-[10px] font-bold text-text-dark/60 uppercase tracking-wider">Best</div>
          <div className="text-lg font-black text-pipe-dark leading-tight">
            {Math.max(score, currentBest)}
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain touch-none outline-none focus:outline-none"
        style={{ cursor: 'pointer', touchAction: 'none', border: 'none' }}
      />
    </div>
  );
};
