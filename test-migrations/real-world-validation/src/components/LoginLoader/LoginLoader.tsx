/**
 * LoginLoader - Configurator V2 Component
 *
 * Component LoginLoader from LoginLoader.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface LoginLoaderProps {

}

export const LoginLoader: React.FC<LoginLoaderProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="loginloader">
      {/* Component implementation */}
    </div>
  );
};

LoginLoader.displayName = 'LoginLoader';

export default LoginLoader;
