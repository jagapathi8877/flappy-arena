import React, { forwardRef } from 'react';
import type { LeaderboardEntry } from '../../types/user';
import { CrownBadge } from './CrownBadge';
import { RankMovement } from './RankMovement';

interface LeaderboardRowProps {
  player: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  rankChange: number;
}

export const LeaderboardRow = forwardRef<HTMLTableRowElement, LeaderboardRowProps>(
  ({ player, rank, isCurrentUser, rankChange }, ref) => {
  const isTop1 = rank === 1;
  const isTop3 = rank <= 3;
  const topTitle = player.gender === 'F' ? 'Flappy Queen' : 'Flappy King';

  return (
    <tr
      ref={ref}
      className={`border-b border-card-border/50 transition-colors ${
        isTop1
          ? 'bg-gold/10 hover:bg-gold/15'
          : isCurrentUser
            ? 'bg-text-dark/[0.04] hover:bg-text-dark/[0.06]'
            : 'hover:bg-sky-bg/30'
      }`}
    >
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-0.5">
          <CrownBadge rank={rank} />
          <RankMovement change={rankChange} />
        </div>
      </td>
      <td className="p-3">
        <div className="font-bold text-text-dark flex items-center gap-2 flex-wrap">
          <span className={isTop1 ? 'text-gold' : ''}>{player.name}</span>
          {isTop1 && (
            <span className="text-[10px] font-black uppercase tracking-wider text-gold bg-gold/15 px-1.5 py-0.5 rounded border border-gold/30">
              {topTitle}
            </span>
          )}
          {isCurrentUser && (
            <span className="px-2 py-0.5 rounded-full bg-pipe-green/15 text-pipe-green text-[10px] font-bold uppercase tracking-wider border border-pipe-green/30">
              You
            </span>
          )}
        </div>
        <div className="text-sm font-semibold font-mono text-text-dark/70 mt-0.5 sm:hidden">
          {player.rollNumber}
        </div>
      </td>
      <td className="p-3 text-text-dark/70 font-mono font-semibold text-sm hidden sm:table-cell">
        {player.rollNumber}
      </td>
      <td className="p-3 text-right">
        <span
          className={`font-mono font-bold text-xl sm:text-2xl ${
            isTop3 ? 'text-[#22c55e]' : 'text-[#22c55e]/80'
          }`}
        >
          {player.bestScore}
        </span>
      </td>
    </tr>
  );
});

LeaderboardRow.displayName = 'LeaderboardRow';
