/**
 * StageProgress - Configurator V2 Component
 *
 * Component StageProgress from StageProgress.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface StageProgressProps {
  currentStage: StageType;
  stageService: IStageService;
  onStageSelect: (stage: StageType) => void;
}

export const StageProgress: React.FC<StageProgressProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="stageprogress">
      {/* Component implementation */}
    </div>
  );
};

StageProgress.displayName = 'StageProgress';

export default StageProgress;
