/**
 * PropertyInfoCard - Configurator V2 Component
 *
 * Component PropertyInfoCard from PropertyInfoCard.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface PropertyInfoCardProps {

}

export const PropertyInfoCard: React.FC<PropertyInfoCardProps> = (props) => {
  const config = useConfigurator();

  const open = useConfiguratorState(true);

  return (
    <div className="propertyinfocard">
      {/* Component implementation */}
    </div>
  );
};

PropertyInfoCard.displayName = 'PropertyInfoCard';

export default PropertyInfoCard;
