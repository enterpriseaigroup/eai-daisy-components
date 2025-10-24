/**
 * Loading - Configurator V2 Component
 *
 * Component Loading from loading.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface LoadingProps {

}

export const Loading: React.FC<LoadingProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="loading">
      {/* Component implementation */}
    </div>
  );
};

Loading.displayName = 'Loading';

export default Loading;
