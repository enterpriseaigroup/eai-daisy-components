/**
 * useChatMessages - Configurator V2 Component
 *
 * Component useChatMessages from ChatMessages.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface useChatMessagesProps {

}

export const useChatMessages: React.FC<useChatMessagesProps> = (props) => {
  const config = useConfigurator();

  const messages = useConfiguratorState([]);
  const isHistoryLoad = useConfiguratorState(false);
  const isTyping = useConfiguratorState(false);
  const showSuggestionBox = useConfiguratorState(false);
  const followUpSuggestions = useConfiguratorState([]);
  const showFollowUpSuggestions = useConfiguratorState(false);

  return (
    <div className="usechatmessages">
      {/* Component implementation */}
    </div>
  );
};

useChatMessages.displayName = 'useChatMessages';

export default useChatMessages;
