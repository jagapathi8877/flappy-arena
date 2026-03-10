import type React from 'react';

interface RankMovementProps {
  change: number;
}

export const RankMovement: React.FC<RankMovementProps> = ({ change }) => {
  if (change > 0) {
    return (
      <span
        className="text-xs font-bold text-green-500 ml-1 inline-block animate-[rankUp_0.4s_ease-out]"
        title={`Up ${change}`}
      >
        ↑{change}
      </span>
    );
  }

  if (change < 0) {
    return (
      <span
        className="text-xs font-bold text-red-500 ml-1 inline-block animate-[rankDown_0.4s_ease-out]"
        title={`Down ${Math.abs(change)}`}
      >
        ↓{Math.abs(change)}
      </span>
    );
  }

  return null;
};
