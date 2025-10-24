/**
 * useDocumentTable - Configurator V2 Component
 *
 * Component useDocumentTable from useDocumentTable.ts
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface useDocumentTableProps {

}

export const useDocumentTable: React.FC<useDocumentTableProps> = (props) => {
  const config = useConfigurator();

  const selectedDoc = useConfiguratorState(null);
  const accessToken = useConfiguratorState(null);

  return (
    <div className="usedocumenttable">
      {/* Component implementation */}
    </div>
  );
};

useDocumentTable.displayName = 'useDocumentTable';

export default useDocumentTable;
