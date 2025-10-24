/**
 * NotFound - Configurator V2 Component
 *
 * Component NotFound from not-found.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface NotFoundProps {

}

export const NotFound: React.FC<NotFoundProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="notfound">
      {/* Component implementation */}
    </div>
  );
};

NotFound.displayName = 'NotFound';

export default NotFound;
