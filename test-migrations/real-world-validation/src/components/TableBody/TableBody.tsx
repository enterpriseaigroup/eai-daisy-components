/**
 * TableBody - Configurator V2 Component
 *
 * Component TableBody from table.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface TableBodyProps {

}

export const TableBody: React.FC<TableBodyProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="tablebody">
      {/* Component implementation */}
    </div>
  );
};

TableBody.displayName = 'TableBody';

export default TableBody;
