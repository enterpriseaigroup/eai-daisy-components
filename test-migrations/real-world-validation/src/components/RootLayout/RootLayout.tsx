/**
 * RootLayout - Configurator V2 Component
 *
 * Component RootLayout from layout.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface RootLayoutProps {

}

export const RootLayout: React.FC<RootLayoutProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="rootlayout">
      {/* Component implementation */}
    </div>
  );
};

RootLayout.displayName = 'RootLayout';

export default RootLayout;
