import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '../../types/user';
import { Tabs } from '../ui/Tabs';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { LeaderboardRow } from './LeaderboardRow';
import { YourPosition } from './YourPosition';

interface LeaderboardTableProps {
  allTimeBoard: LeaderboardEntry[];
  weeklyBoard: LeaderboardEntry[];
  liveUpdateTick: number;
  currentRollNumber: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  allTimeBoard,
  weeklyBoard,
  liveUpdateTick,
  currentRollNumber,
}) => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const prevRanksRef = useRef<{ weekly: Map<string, number>; alltime: Map<string, number> }>({
    weekly: new Map(),
    alltime: new Map(),
  });
  const hasSnapshotRef = useRef<{ weekly: boolean; alltime: boolean }>({
    weekly: false,
    alltime: false,
  });
  const lastBoardRef = useRef<{ weekly: LeaderboardEntry[] | null; alltime: LeaderboardEntry[] | null }>({
    weekly: null,
    alltime: null,
  });
  const lastLiveTickRef = useRef<{ weekly: number; alltime: number }>({
    weekly: 0,
    alltime: 0,
  });

  const board = activeTab === 'weekly' ? weeklyBoard : allTimeBoard;
  const boardKey = activeTab === 'weekly' ? 'weekly' : 'alltime';
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const rankedBoard = useMemo(
    () => board.map((player, index) => ({ player, rank: index + 1 })),
    [board],
  );

  const filteredRows = useMemo(() => {
    if (!normalizedQuery) return rankedBoard;

    return rankedBoard.filter(({ player }) => {
      const name = player.name.toLowerCase();
      const rollNumber = player.rollNumber.toLowerCase();
      return name.includes(normalizedQuery) || rollNumber.includes(normalizedQuery);
    });
  }, [rankedBoard, normalizedQuery]);

  // Compute rank changes
  const rankChanges = useMemo(() => {
    const changes = new Map<string, number>();
    const prev = prevRanksRef.current[boardKey];
    const boardChanged = lastBoardRef.current[boardKey] !== board;
    const isLiveBoardUpdate = boardChanged && liveUpdateTick > lastLiveTickRef.current[boardKey];

    if (isLiveBoardUpdate) {
      lastLiveTickRef.current[boardKey] = liveUpdateTick;
    }

    lastBoardRef.current[boardKey] = board;

    if (!hasSnapshotRef.current[boardKey] || !isLiveBoardUpdate) return changes;

    board.forEach((p, i) => {
      const prevRank = prev.get(p.rollNumber);
      if (prevRank !== undefined) {
        changes.set(p.rollNumber, prevRank - (i + 1));
      }
    });

    return changes;
  }, [board, boardKey, liveUpdateTick]);

  // Update previous ranks snapshot per leaderboard after render
  useEffect(() => {
    const map = new Map<string, number>();
    weeklyBoard.forEach((p, i) => map.set(p.rollNumber, i + 1));
    prevRanksRef.current.weekly = map;
    hasSnapshotRef.current.weekly = true;
  }, [weeklyBoard]);

  useEffect(() => {
    const map = new Map<string, number>();
    allTimeBoard.forEach((p, i) => map.set(p.rollNumber, i + 1));
    prevRanksRef.current.alltime = map;
    hasSnapshotRef.current.alltime = true;
  }, [allTimeBoard]);

  // Jump to my rank
  // Flappy title holder — rank 1 with score > 0
  const king = board.length > 0 && board[0].bestScore > 0 ? board[0] : null;
  const throneTitle = king?.gender === 'F' ? 'Current Flappy Queen' : 'Current Flappy King';

  return (
    <div className="space-y-3">
      {/* Your Position + Rank Window */}
      <YourPosition board={board} currentRollNumber={currentRollNumber} />

      {/* Flappy Throne */}
      {king && (
        <Card className="p-4 sm:p-5 text-center bg-gradient-to-b from-gold/10 to-transparent border-gold/30">
          <div className="text-3xl mb-1" style={{ filter: 'drop-shadow(0 0 8px rgba(240, 184, 0, 0.5))' }}>👑</div>
          <div className="text-xs font-black uppercase tracking-widest text-gold/70 mb-1">
            {throneTitle}
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
        <div className="p-3 sm:p-5 border-b border-card-border bg-white/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
                <Trophy className="w-5 h-5 text-gold" />
              </div>
              <h2 className="text-lg font-bold text-text-dark">Live Leaderboard</h2>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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

              <div className="w-full sm:w-[300px] flex items-center gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find friend by name or roll no."
                  aria-label="Search leaderboard"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="shrink-0 px-3 py-2 rounded-xl border border-card-border bg-white text-text-dark/70 text-sm font-semibold hover:bg-sky-bg/30 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {normalizedQuery && (
            <div className="mt-2 text-xs text-text-dark/50 font-medium">
              {filteredRows.length} match{filteredRows.length === 1 ? '' : 'es'} in{' '}
              {activeTab === 'weekly' ? 'Weekly' : 'All-Time'}
            </div>
          )}
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
              {filteredRows.map(({ player, rank }) => (
                <LeaderboardRow
                  key={player.rollNumber}
                  player={player}
                  rank={rank}
                  isCurrentUser={player.rollNumber === currentRollNumber}
                  rankChange={rankChanges.get(player.rollNumber) ?? 0}
                />
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-dark/40">
                    {normalizedQuery
                      ? `No player found for "${searchQuery.trim()}".`
                      : activeTab === 'weekly'
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
