import React, { useCallback, useMemo } from "react";
import { BaseRecord, HttpError } from "@refinedev/core";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  CreateButton,
} from "@refinedev/antd";
import { Table, Space, Typography, notification } from "antd";
import { useTranslation } from "react-i18next";

import { RoleResponse } from "../../interfaces/index.d";

// Constants
const DELETE_REFETCH_DELAY = 2000;

export const RoleList: React.FC = () => {
  const { t } = useTranslation();
  
  // Table hook
  const { tableProps, tableQueryResult } = useTable<RoleResponse, HttpError>({
    syncWithLocation: true,
    resource: "roles",
  });

  // Memoized table column titles
  const columnTitles = useMemo(() => ({
    id: t("roles.fields.id", "ID"),
    name: t("roles.fields.name", "Name"),
    description: t("roles.fields.description", "Description"),
    permissions: t("roles.fields.permissions", "Permissions"),
    actions: t("common.table.actions", "Actions"),
  }), [t]);

  // Error handlers
  const handleDeleteSuccess = useCallback(() => {
    notification.success({
      message: t("notifications.success"),
      description: t("notifications.deleteSuccess", {
        resource: t("roles.title", "Role"),
      }),
    });
    
    // Refetch table data after successful deletion
    setTimeout(() => {
      try {
        tableQueryResult.refetch();
      } catch (error) {
        console.error("Failed to refetch roles after deletion:", error);
      }
    }, DELETE_REFETCH_DELAY);
  }, [t, tableQueryResult]);

  const handleDeleteError = useCallback((error: any) => {
    console.error("Role deletion failed:", error);
    notification.error({
      message: t("notifications.error"),
      description: t("notifications.deleteError", {
        resource: t("roles.title", "Role"),
      }),
    });
  }, [t]);

  // Render functions
  const renderRoleId = useCallback((id: string) => (
    <Typography.Text style={{ whiteSpace: "nowrap" }}>
      {id}
    </Typography.Text>
  ), []);

  const renderPermissions = useCallback((permissions: string[]) => {
    if (!permissions || permissions.length === 0) {
      return (
        <Typography.Text type="secondary">
          {t("roles.noPermissions", "No permissions assigned")}
        </Typography.Text>
      );
    }
    
    return (
      <Typography.Text style={{ wordBreak: "break-word" }}>
        {permissions.join(", ")}
      </Typography.Text>
    );
  }, [t]);

  const renderTableActions = useCallback((record: BaseRecord) => (
    <Space>
      <EditButton 
        hideText 
        size="small" 
        recordItemId={record.id}
        resource="roles"
      />
      <ShowButton 
        hideText 
        size="small" 
        recordItemId={record.id}
        resource="roles"
      />
      <DeleteButton 
        hideText 
        size="small" 
        recordItemId={record.id}
        resource="roles"
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        invalidates={[]}
      />
    </Space>
  ), [handleDeleteSuccess, handleDeleteError]);

  return (
    <List
      headerButtons={[
        <CreateButton key="create-role" resource="roles">
          {t("roles.actions.add", "Create Role")}
        </CreateButton>,
      ]}
      title={t("roles.titles.list", "Role Management")}
    >
      <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
        <Table.Column 
          dataIndex="id" 
          title={columnTitles.id}
          render={renderRoleId}
          width={100}
        />
        
        <Table.Column 
          dataIndex="name" 
          title={columnTitles.name}
          sorter
          width={200}
        />
        
        <Table.Column 
          dataIndex="description" 
          title={columnTitles.description}
          ellipsis
          width={300}
        />
        
        <Table.Column
          title={columnTitles.permissions}
          dataIndex="permissions"
          render={renderPermissions}
          ellipsis
        />
        
        <Table.Column<RoleResponse>
          title={columnTitles.actions}
          dataIndex="actions"
          render={(_, record) => renderTableActions(record)}
          fixed="right"
          width={120}
        />
      </Table>
    </List>
  );
};
