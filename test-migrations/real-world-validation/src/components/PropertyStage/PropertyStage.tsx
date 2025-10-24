/**
 * PropertyStage - Configurator V2 Component
 *
 * Component PropertyStage from PropertyStage.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface PropertyStageProps {
  onStageChange?: (stage: StageType) => void;
}

export const PropertyStage: React.FC<PropertyStageProps> = (props) => {
  const config = useConfigurator();

  const addressStarted = useConfiguratorState(false);

  return (
    <div className="propertystage">
      {/* Component implementation */}
    </div>
  );
};

PropertyStage.displayName = 'PropertyStage';

export default PropertyStage;
