/**
 * Input - Configurator V2 Component
 *
 * Component Input from input.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface InputProps {

}

export const Input: React.FC<InputProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="input">
      {/* Component implementation */}
    </div>
  );
};

Input.displayName = 'Input';

export default Input;
