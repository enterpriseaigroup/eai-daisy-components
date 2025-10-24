/**
 * DialogDescription - Configurator V2 Component
 *
 * Component DialogDescription from dialog.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface DialogDescriptionProps {

}

export const DialogDescription: React.FC<DialogDescriptionProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="dialogdescription">
      {/* Component implementation */}
    </div>
  );
};

DialogDescription.displayName = 'DialogDescription';

export default DialogDescription;
