/**
 * ChatSetup - Configurator V2 Component
 *
 * Component ChatSetup from ChatSetup.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface ChatSetupProps {

}

export const ChatSetup: React.FC<ChatSetupProps> = (props) => {
  const config = useConfigurator();

  const token = useConfiguratorState(null);
  const conversation_id = useConfiguratorState(null);
  const userId = useConfiguratorState('');

  return (
    <div className="chatsetup">
      {/* Component implementation */}
    </div>
  );
};

ChatSetup.displayName = 'ChatSetup';

export default ChatSetup;
