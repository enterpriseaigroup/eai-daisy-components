/**
 * Home - Configurator V2 Component
 *
 * Component Home from page.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface HomeProps {

}

export const Home: React.FC<HomeProps> = (props) => {
  const config = useConfigurator();

  const isLoading = useConfiguratorState(true);
  const isLoggingIn = useConfiguratorState(false);
  const isRedirectFromCouncilPortal = useConfiguratorState(false);

  return (
    <div className="home">
      {/* Component implementation */}
    </div>
  );
};

Home.displayName = 'Home';

export default Home;
