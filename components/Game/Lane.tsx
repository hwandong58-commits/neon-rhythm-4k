import React from 'react';
import { KeyType } from '../../types';
import { LANE_WIDTH_PX } from '../../constants';

interface LaneProps {
  laneKey: KeyType;
  isLast: boolean;
}

export const Lane: React.FC<LaneProps> = ({ isLast }) => {
  return (
    <div 
      className={`h-full border-r border-game-border bg-transparent relative`}
      style={{ width: LANE_WIDTH_PX, borderRightWidth: isLast ? 0 : 1 }}
    >
      {/* Background track line */}
      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-game-border opacity-30 transform -translate-x-1/2"></div>
    </div>
  );
};
