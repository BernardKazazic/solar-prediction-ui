import React from "react";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
} from "@refinedev/antd";
import { Table, Space } from "antd";
import { BaseRecord } from "@refinedev/core";
import { IRoleResponse } from "../../interfaces/index.d"; // Adjust path if necessary

export const RoleList: React.FC = () => {
  const { tableProps } = useTable<IRoleResponse>({
    syncWithLocation: true,
    resource: "roles",
    pagination: {
      mode: "server", // Use server-side pagination
    },
    sorters: {
      mode: "server", // Use server-side sorting if backend supports it
    },
    filters: {
      mode: "server", // Use server-side filtering if backend supports it
    },
  });

  // Note: The refine data provider needs to handle the 'content' field for data
  // and 'totalElements' for the total count in the paginated response.
  // If it doesn't, the provider might need adjustment.

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="name" title="Name" sorter />
        <Table.Column dataIndex="description" title="Description" />
        <Table.Column
          title="Permissions"
          dataIndex="permissions"
          render={(permissions: string[]) => permissions?.join(", ") || "N/A"} // Display permission names
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
