import React from "react";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  CreateButton,
} from "@refinedev/antd";
import { Table, Space } from "antd";
import { BaseRecord } from "@refinedev/core";
import { IRoleResponse } from "../../interfaces/index.d";
import { useTranslation } from "react-i18next";

export const RoleList: React.FC = () => {
  const { t } = useTranslation();
  const { tableProps } = useTable<IRoleResponse>({
    syncWithLocation: true,
    resource: "roles",
  });

  // Pre-translate titles
  const titleId = t("roles.fields.id", "ID");
  const titleName = t("roles.fields.name", "Name");
  const titleDescription = t("roles.fields.description", "Description");
  const titlePermissions = t("roles.fields.permissions", "Permissions");
  const titleActions = t("table.actions", "Actions");

  return (
    <List
      headerButtons={[
        <CreateButton key="create-role" resource="roles">
          {t("roles.actions.add", "Create Role")}
        </CreateButton>,
      ]}
      title={t("roles.titles.list", "Role Management")}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={titleId} />
        <Table.Column dataIndex="name" title={titleName} sorter />
        <Table.Column dataIndex="description" title={titleDescription} />
        <Table.Column
          title={titlePermissions}
          dataIndex="permissions"
          render={(permissions: string[]) => permissions?.join(", ") || "N/A"}
        />
        <Table.Column
          title={titleActions}
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
