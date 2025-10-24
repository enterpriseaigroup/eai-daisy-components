/**
 * useStageContent - Configurator V2 Component
 *
 * Component useStageContent from useStageContent.ts
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface useStageContentProps {

}

export const useStageContent: React.FC<useStageContentProps> = (props) => {
  const config = useConfigurator();

  const isSidebarOpen = useConfiguratorState(false);
  const showBotNotification = useConfiguratorState(false);
  const isChatOpen = useConfiguratorState(true);

  return (
    <div className="usestagecontent">
      {/* Component implementation */}
    </div>
  );
};

useStageContent.displayName = 'useStageContent';

export default useStageContent;
