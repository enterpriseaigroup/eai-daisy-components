/**
 * MSALProvider - Configurator V2 Component
 *
 * Component MSALProvider from MSALAuthProvider.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface MSALProviderProps {
  children: React.ReactNode;
  instance?: PublicClientApplication;
}

export const MSALProvider: React.FC<MSALProviderProps> = (props) => {
  const config = useConfigurator();

  const isInitialized = useConfiguratorState(false);

  return (
    <div className="msalprovider">
      {/* Component implementation */}
    </div>
  );
};

MSALProvider.displayName = 'MSALProvider';

export default MSALProvider;
