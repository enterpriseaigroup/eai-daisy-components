/**
 * useCreateSecurityGroup - Configurator V2 Component
 *
 * Component useCreateSecurityGroup from useCreateSecurityGroup.ts
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface useCreateSecurityGroupProps {

}

export const useCreateSecurityGroup: React.FC<useCreateSecurityGroupProps> = (props) => {
  const config = useConfigurator();

  const data = useConfiguratorState(null);

  return (
    <div className="usecreatesecuritygroup">
      {/* Component implementation */}
    </div>
  );
};

useCreateSecurityGroup.displayName = 'useCreateSecurityGroup';

export default useCreateSecurityGroup;
