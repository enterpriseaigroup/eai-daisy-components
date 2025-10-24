/**
 * useIsMobile - Configurator V2 Component
 *
 * Component useIsMobile from useIsMobile.ts
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface useIsMobileProps {

}

export const useIsMobile: React.FC<useIsMobileProps> = (props) => {
  const config = useConfigurator();

  const isMobile = useConfiguratorState(();

  return (
    <div className="useismobile">
      {/* Component implementation */}
    </div>
  );
};

useIsMobile.displayName = 'useIsMobile';

export default useIsMobile;
