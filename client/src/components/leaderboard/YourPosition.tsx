import type React from 'react';
import type { LeaderboardEntry } from '../../types/user';
import { Card } from '../ui/Card';

interface YourPositionProps {
  board: LeaderboardEntry[];
  currentRollNumber: string;
}

export const YourPosition: React.FC<YourPositionProps> = ({ board, currentRollNumber }) => {
  const idx = board.findIndex((p) => p.rollNumber === currentRollNumber);
  if (idx === -1) return null;

  const player = board[idx];
  const rank = idx + 1;

  // Motivation target data
  const getTarget = () => {
    if (idx === 0 && player.bestScore > 0) {
      return { type: 'king' as const };
    }
    if (idx > 0) {
      const above = board[idx - 1];
      const gap = above.bestScore - player.bestScore;
      if (rank > 10) {
        const top10Score = board[9]?.bestScore ?? 0;
        const gapToTop10 = top10Score - player.bestScore;
        if (gapToTop10 > 0) {
          return { type: 'milestone' as const, label: 'Top 10', points: gapToTop10 };
        }
      }
      return { type: 'player' as const, name: above.name, targetRank: rank - 1, points: gap };
    }
    return { type: 'default' as const };
  };
  const target = getTarget();

  // Nearby ranks: 2 above, current, 2 below
  const windowStart = Math.max(0, idx - 2);
  const windowEnd = Math.min(board.length, idx + 3);
  const neighbors = board.slice(windowStart, windowEnd);

  return (
    <Card className="p-3 sm:p-4 space-y-3">
      {/* Your Position header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-text-dark/40">
          Your Position
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-xs text-text-dark/40 font-semibold">Rank</span>
          <span className="text-xl font-black text-pipe-dark">#{rank}</span>
          <span className="text-xs text-text-dark/40 font-semibold">Score</span>
          <span className="text-xl font-black text-pipe-green">{player.bestScore}</span>
        </div>
      </div>

      {/* Rank window */}
      <div className="rounded-lg overflow-hidden border border-card-border/60">
        <table className="w-full text-left border-collapse text-sm">
          <tbody>
            {neighbors.map((p, i) => {
              const r = windowStart + i + 1;
              const isYou = p.rollNumber === currentRollNumber;
              return (
                <tr
                  key={p.rollNumber}
                  className={`border-b border-card-border/30 last:border-0 ${
                    isYou ? 'bg-text-dark/[0.04]' : ''
                  }`}
                >
                  <td className="px-3 py-1.5 w-12 text-center text-text-dark/50 font-mono font-semibold text-xs">
                    {r}
                  </td>
                  <td className="px-2 py-1.5 text-text-dark/80 font-medium text-xs">
                    <span className="flex items-center gap-1.5">
                      {p.name}
                      {isYou && (
                        <span className="px-1.5 py-px rounded-full bg-pipe-green/15 text-pipe-green text-[9px] font-bold uppercase tracking-wider border border-pipe-green/25">
                          You
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono font-bold text-xs text-pipe-green/80">
                    {p.bestScore}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Motivation */}
      {target.type === 'king' ? (
        <div className="bg-gold/10 rounded-xl p-3 border border-gold/25 text-center">
          <div className="text-xs font-black uppercase tracking-widest text-gold">
            👑 You are #1 — Defend your throne!
          </div>
        </div>
      ) : target.type === 'player' ? (
        <div className="bg-sky-bg/20 rounded-xl p-3 border border-card-border/60 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm">🎯</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-dark/50">
              Next Target
            </span>
          </div>
          <div className="text-sm font-bold text-text-dark">
            {target.name} <span className="text-text-dark/40 font-normal">(#{target.targetRank})</span>
          </div>
          <div className="text-xs text-text-dark/60">
            {target.points === 0 ? (
              <>Tied — <span className="font-bold text-pipe-green">1 more point</span> to take the position</>
            ) : (
              <>Only <span className="font-bold text-pipe-green">{target.points} point{target.points === 1 ? '' : 's'}</span> to overtake</>
            )}
          </div>
        </div>
      ) : target.type === 'milestone' ? (
        <div className="bg-sky-bg/20 rounded-xl p-3 border border-card-border/60 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm">🎯</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-dark/50">
              Next Milestone
            </span>
          </div>
          <div className="text-sm font-bold text-text-dark">{target.label}</div>
          <div className="text-xs text-text-dark/60">
            <span className="font-bold text-pipe-green">{target.points} point{target.points === 1 ? '' : 's'}</span> to break in
          </div>
        </div>
      ) : (
        <div className="text-xs text-text-dark/50 text-center font-medium">
          Keep playing to climb the leaderboard!
        </div>
      )}
    </Card>
  );
};
