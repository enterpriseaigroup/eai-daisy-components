/**
 * DialogClose - Configurator V2 Component
 *
 * Component DialogClose from dialog.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface DialogCloseProps {

}

export const DialogClose: React.FC<DialogCloseProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="dialogclose">
      {/* Component implementation */}
    </div>
  );
};

DialogClose.displayName = 'DialogClose';

export default DialogClose;
