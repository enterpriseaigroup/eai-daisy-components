/**
 * Loader - Configurator V2 Component
 *
 * Component Loader from Loader.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface LoaderProps {

}

export const Loader: React.FC<LoaderProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="loader">
      {/* Component implementation */}
    </div>
  );
};

Loader.displayName = 'Loader';

export default Loader;
