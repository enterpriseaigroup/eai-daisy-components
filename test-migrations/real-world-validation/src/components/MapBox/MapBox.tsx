/**
 * MapBox - Configurator V2 Component
 *
 * Component MapBox from MapBox.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface MapBoxProps {
  selectedAddress: string;
  propID: string | null;
  onLotSizeUpdate: ({ lotSize;
}

export const MapBox: React.FC<MapBoxProps> = (props) => {
  const config = useConfigurator();

  const map = useConfiguratorState(null);
  const marker = useConfiguratorState(null);
  const is3DMode = useConfiguratorState(true);

  return (
    <div className="mapbox">
      {/* Component implementation */}
    </div>
  );
};

MapBox.displayName = 'MapBox';

export default MapBox;
