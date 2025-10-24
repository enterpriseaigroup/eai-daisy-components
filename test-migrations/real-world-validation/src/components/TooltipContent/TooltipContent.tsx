/**
 * TooltipContent - Configurator V2 Component
 *
 * Component TooltipContent from tooltip.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface TooltipContentProps {

}

export const TooltipContent: React.FC<TooltipContentProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="tooltipcontent">
      {/* Component implementation */}
    </div>
  );
};

TooltipContent.displayName = 'TooltipContent';

export default TooltipContent;
