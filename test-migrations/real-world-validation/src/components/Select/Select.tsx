/**
 * Select - Configurator V2 Component
 *
 * Component Select from select.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface SelectProps {

}

export const Select: React.FC<SelectProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="select">
      {/* Component implementation */}
    </div>
  );
};

Select.displayName = 'Select';

export default Select;
