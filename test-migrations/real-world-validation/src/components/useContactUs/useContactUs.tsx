/**
 * useContactUs - Configurator V2 Component
 *
 * Component useContactUs from useContactUs.ts
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface useContactUsProps {

}

export const useContactUs: React.FC<useContactUsProps> = (props) => {
  const config = useConfigurator();

  const formData = useConfiguratorState({
        first_name: "",
        last_name: "",
        email: "",
        title: "",
        description: "",
    });
  const responseMessage = useConfiguratorState("");
  const isSubmitting = useConfiguratorState(false);

  return (
    <div className="usecontactus">
      {/* Component implementation */}
    </div>
  );
};

useContactUs.displayName = 'useContactUs';

export default useContactUs;
