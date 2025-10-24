/**
 * DialogContent - Configurator V2 Component
 *
 * Component DialogContent from dialog.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface DialogContentProps {

}

export const DialogContent: React.FC<DialogContentProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="dialogcontent">
      {/* Component implementation */}
    </div>
  );
};

DialogContent.displayName = 'DialogContent';

export default DialogContent;
