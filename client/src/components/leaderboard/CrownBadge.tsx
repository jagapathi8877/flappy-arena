import type React from 'react';

interface CrownBadgeProps {
  rank: number;
}

export const CrownBadge: React.FC<CrownBadgeProps> = ({ rank }) => {
  if (rank === 1) {
    return <span className="text-2xl drop-shadow-md" title="Top Rank">👑</span>;
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-silver/20 border border-silver/40">
        <span className="text-sm font-black text-silver">2</span>
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-bronze/20 border border-bronze/40">
        <span className="text-sm font-black text-bronze">3</span>
      </span>
    );
  }
  return (
    <span className="text-text-dark/50 font-bold font-mono text-sm">
      {rank}
    </span>
  );
};
