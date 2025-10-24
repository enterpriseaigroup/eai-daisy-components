/**
 * Button - Configurator V2 Component
 *
 * Component Button from button.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface ButtonProps {

}

export const Button: React.FC<ButtonProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="button">
      {/* Component implementation */}
    </div>
  );
};

Button.displayName = 'Button';

export default Button;
