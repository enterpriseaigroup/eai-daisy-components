/**
 * TestProvider - Configurator V2 Component
 *
 * Component TestProvider from TestContext.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface TestProviderProps {

}

export const TestProvider: React.FC<TestProviderProps> = (props) => {
  const config = useConfigurator();

  const value = useConfiguratorState("Initial value");

  return (
    <div className="testprovider">
      {/* Component implementation */}
    </div>
  );
};

TestProvider.displayName = 'TestProvider';

export default TestProvider;
