/**
 * DialogTitle - Configurator V2 Component
 *
 * Component DialogTitle from dialog.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface DialogTitleProps {

}

export const DialogTitle: React.FC<DialogTitleProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="dialogtitle">
      {/* Component implementation */}
    </div>
  );
};

DialogTitle.displayName = 'DialogTitle';

export default DialogTitle;
