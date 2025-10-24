/**
 * TableRow - Configurator V2 Component
 *
 * Component TableRow from table.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface TableRowProps {

}

export const TableRow: React.FC<TableRowProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="tablerow">
      {/* Component implementation */}
    </div>
  );
};

TableRow.displayName = 'TableRow';

export default TableRow;
