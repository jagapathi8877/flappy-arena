import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '../../types/user';
import { Tabs } from '../ui/Tabs';
import { Card } from '../ui/Card';
import { LeaderboardRow } from './LeaderboardRow';
import { YourPosition } from './YourPosition';

interface LeaderboardTableProps {
  allTimeBoard: LeaderboardEntry[];
  weeklyBoard: LeaderboardEntry[];
  currentRollNumber: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  allTimeBoard,
  weeklyBoard,
  currentRollNumber,
}) => {
  const [activeTab, setActiveTab] = useState('weekly');
  const prevRanksRef = useRef<Map<string, number>>(new Map());

  const board = activeTab === 'weekly' ? weeklyBoard : allTimeBoard;

  // Compute rank changes
  const rankChanges = useMemo(() => {
    const changes = new Map<string, number>();
    const prev = prevRanksRef.current;
    board.forEach((p, i) => {
      const prevRank = prev.get(p.rollNumber);
      if (prevRank !== undefined) {
        changes.set(p.rollNumber, prevRank - (i + 1));
      }
    });
    return changes;
  }, [board]);

  // Update previous ranks after render
  useEffect(() => {
    const map = new Map<string, number>();
    board.forEach((p, i) => map.set(p.rollNumber, i + 1));
    prevRanksRef.current = map;
  }, [board]);

  // Jump to my rank
  // Flappy King — rank 1 with score > 0
  const king = board.length > 0 && board[0].bestScore > 0 ? board[0] : null;

  return (
    <div className="space-y-3">
      {/* Your Position + Rank Window */}
      <YourPosition board={board} currentRollNumber={currentRollNumber} />

      {/* Flappy King Throne */}
      {king && (
        <Card className="p-4 sm:p-5 text-center bg-gradient-to-b from-gold/10 to-transparent border-gold/30">
          <div className="text-3xl mb-1" style={{ filter: 'drop-shadow(0 0 8px rgba(240, 184, 0, 0.5))' }}>👑</div>
          <div className="text-xs font-black uppercase tracking-widest text-gold/70 mb-1">
            Current Flappy King
          </div>
          <div className="text-lg sm:text-xl font-black text-text-dark">
            {king.name}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-pipe-green mt-1">
            {king.bestScore}
          </div>
        </Card>
      )}

      <Card className="min-h-[350px] sm:min-h-[500px] flex flex-col overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-card-border bg-white/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
              <Trophy className="w-5 h-5 text-gold" />
            </div>
            <h2 className="text-lg font-bold text-text-dark">
              Live Leaderboard
            </h2>
          </div>
          <div className="w-full sm:w-auto">
            <Tabs
              tabs={[
                { id: 'weekly', label: 'Weekly' },
                { id: 'alltime', label: 'All-Time' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-text-dark/40 text-xs uppercase tracking-wider bg-sky-bg/20">
                <th className="p-3 font-semibold w-20 text-center">Rank</th>
                <th className="p-3 font-semibold">Student</th>
                <th className="p-3 font-semibold hidden sm:table-cell">Roll No.</th>
                <th className="p-3 font-semibold text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {board.map((player, index) => (
                <LeaderboardRow
                  key={player.rollNumber}
                  player={player}
                  rank={index + 1}
                  isCurrentUser={player.rollNumber === currentRollNumber}
                  rankChange={rankChanges.get(player.rollNumber) ?? 0}
                />
              ))}
              {board.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-dark/40">
                    {activeTab === 'weekly'
                      ? 'No scores this week yet. Be the first!'
                      : 'No scores yet. Play to see the leaderboard!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
