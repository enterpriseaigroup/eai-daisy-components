/**
 * DialogOverlay - Configurator V2 Component
 *
 * Component DialogOverlay from dialog.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface DialogOverlayProps {

}

export const DialogOverlay: React.FC<DialogOverlayProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="dialogoverlay">
      {/* Component implementation */}
    </div>
  );
};

DialogOverlay.displayName = 'DialogOverlay';

export default DialogOverlay;
