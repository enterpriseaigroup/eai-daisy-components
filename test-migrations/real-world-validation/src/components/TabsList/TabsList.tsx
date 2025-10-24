/**
 * TabsList - Configurator V2 Component
 *
 * Component TabsList from tabs.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface TabsListProps {

}

export const TabsList: React.FC<TabsListProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="tabslist">
      {/* Component implementation */}
    </div>
  );
};

TabsList.displayName = 'TabsList';

export default TabsList;
