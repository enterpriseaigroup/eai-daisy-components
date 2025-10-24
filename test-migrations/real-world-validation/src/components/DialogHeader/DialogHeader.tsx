/**
 * DialogHeader - Configurator V2 Component
 *
 * Component DialogHeader from dialog.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface DialogHeaderProps {

}

export const DialogHeader: React.FC<DialogHeaderProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="dialogheader">
      {/* Component implementation */}
    </div>
  );
};

DialogHeader.displayName = 'DialogHeader';

export default DialogHeader;
