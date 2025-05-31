import React from "react";
import { Transfer, TransferProps } from "antd";
import type { TransferDirection } from "antd/es/transfer";

interface FormTransferProps extends Omit<TransferProps, 'targetKeys' | 'onChange'> {
  value?: string[];
  onChange?: (value: string[]) => void;
}

/**
 * FormTransfer component that integrates Ant Design's Transfer component with Form.Item
 * This component automatically handles the value/onChange props passed by Form.Item
 * and preserves the selection order
 */
export const FormTransfer: React.FC<FormTransferProps> = ({ 
  value, 
  onChange, 
  ...transferProps 
}) => {
  const handleChange = (nextTargetKeys: React.Key[], direction: TransferDirection, moveKeys: React.Key[]) => {
    let newTargetKeys: string[];
    
    const stringMoveKeys = moveKeys.map(key => String(key));
    
    if (direction === 'right') {
      // Adding items: append new items to the end to preserve selection order
      newTargetKeys = [...(value || []), ...stringMoveKeys];
    } else {
      // Removing items: filter out the removed items while preserving order
      newTargetKeys = (value || []).filter(key => !stringMoveKeys.includes(key));
    }
    
    onChange?.(newTargetKeys);
  };

  return (
    <Transfer
      {...transferProps}
      targetKeys={value || []}
      onChange={handleChange}
    />
  );
};

export default FormTransfer; 