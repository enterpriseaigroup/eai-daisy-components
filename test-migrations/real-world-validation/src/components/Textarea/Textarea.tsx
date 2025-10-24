/**
 * Textarea - Configurator V2 Component
 *
 * Component Textarea from textarea.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface TextareaProps {

}

export const Textarea: React.FC<TextareaProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="textarea">
      {/* Component implementation */}
    </div>
  );
};

Textarea.displayName = 'Textarea';

export default Textarea;
