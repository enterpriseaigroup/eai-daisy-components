/**
 * TableCell - Configurator V2 Component
 *
 * Component TableCell from table.tsx
 */

import React from 'react';
import { useConfigurator } from '@configurator/sdk';


export interface TableCellProps {

}

export const TableCell: React.FC<TableCellProps> = (props) => {
  const config = useConfigurator();



  return (
    <div className="tablecell">
      {/* Component implementation */}
    </div>
  );
};

TableCell.displayName = 'TableCell';

export default TableCell;
