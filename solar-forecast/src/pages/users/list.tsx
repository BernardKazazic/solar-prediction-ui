import React, { useState, useCallback, useRef } from "react";
import {
  useTranslate,
  HttpError,
} from "@refinedev/core";
import {
  List,
  useTable,
  DeleteButton,
  CreateButton,
  TagField,
  EmailField,
  EditButton,
} from "@refinedev/antd";
import {
  Table,
  Avatar,
  Typography,
  theme,
  Space,
  notification,
} from "antd";
import { UserOutlined } from "@ant-design/icons";

import {
  UserResponse,
  RoleInfo,
} from "../../interfaces";

import { TicketUrlModal } from "../../components/users/TicketUrlModal";
import { CreateUserModal, CreateUserModalRef } from "../../components/users/CreateUserModal";

// Constants
const DELETE_REFETCH_DELAY = 2000;

export const UserList: React.FC = () => {
  const t = useTranslate();
  const { token } = theme.useToken();

  // Refs
  const createModalRef = useRef<CreateUserModalRef>(null);

  // State for the ticket URL modal
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [ticketUrl, setTicketUrl] = useState<string | undefined>(undefined);

  // Table hook
  const { tableProps, tableQueryResult } = useTable<UserResponse, HttpError>({
    resource: "users",
    syncWithLocation: true,
  });

  // Modal handlers
  const handleShowTicketModal = useCallback((url: string) => {
    if (!url) {
      console.error("Attempted to show ticket modal with empty URL");
      notification.error({
        message: t("users.ticketUrl.fetchErrorTitle"),
        description: t("users.ticketUrl.fetchErrorDesc"),
      });
      return;
    }
    
    setTicketUrl(url);
    setIsTicketModalVisible(true);
  }, [t]);

  const handleCloseTicketModal = useCallback(() => {
    setIsTicketModalVisible(false);
    setTicketUrl(undefined);
  }, []);

  const handleRefetchTable = useCallback(() => {
    try {
      tableQueryResult.refetch();
    } catch (error) {
      console.error("Failed to refetch table data:", error);
      notification.error({
        message: t("notifications.error"),
        description: t("notifications.fetchError"),
      });
    }
  }, [tableQueryResult, t]);

  const handleDeleteSuccess = useCallback(() => {
    notification.success({
      message: t("notifications.success"),
      description: t("notifications.deleteSuccess", {
        resource: t("users.title", "User"),
      }),
    });
    
    // Refetch table data after successful deletion
    setTimeout(() => {
      handleRefetchTable();
    }, DELETE_REFETCH_DELAY);
  }, [t, handleRefetchTable]);

  const handleDeleteError = useCallback((error: any) => {
    console.error("User deletion failed:", error);
    notification.error({
      message: t("notifications.error"),
      description: t("notifications.deleteError", {
        resource: t("users.title", "User"),
      }),
    });
  }, [t]);

  const handleShowCreateModal = useCallback(() => {
    if (createModalRef.current) {
      createModalRef.current.show();
    } else {
      console.error("Create modal ref not available");
      notification.error({
        message: t("notifications.error"),
        description: t("common.tryAgain"),
      });
    }
  }, [t]);

  const renderUserAvatar = useCallback((pictureUrl: string) => (
    <Avatar 
      src={pictureUrl} 
      icon={<UserOutlined />} 
      alt="User Avatar" 
    />
  ), []);

  const renderUserId = useCallback((id: string) => (
    <Typography.Text style={{ whiteSpace: "nowrap" }}>
      {id}
    </Typography.Text>
  ), []);

  const renderUserRoles = useCallback((roles: RoleInfo[]) => (
    <>
      {roles?.map((role) => (
        <TagField
          key={role.id}
          value={role.name}
          style={{ margin: "2px" }}
        />
      ))}
    </>
  ), []);

  const renderTableActions = useCallback((record: UserResponse) => (
    <Space>
      <DeleteButton
        hideText
        size="small"
        recordItemId={record.id}
        invalidates={[]}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
      />
      <EditButton 
        hideText 
        size="small" 
        recordItemId={record.id} 
      />
    </Space>
  ), [handleDeleteSuccess, handleDeleteError]);

  return (
    <List
      headerButtons={[
        <CreateButton 
          key="create-user" 
          onClick={handleShowCreateModal}
        >
          {t("users.actions.invite", "Invite User")}
        </CreateButton>,
      ]}
    >
      <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
        <Table.Column
          dataIndex="picture"
          title={t("users.fields.avatar.label", "Avatar")}
          render={renderUserAvatar}
          width={80}
          align="center"
        />
        
        <Table.Column
          key="id"
          dataIndex="id"
          title={t("users.fields.id", "ID")}
          render={renderUserId}
        />
        
        <Table.Column
          key="email"
          dataIndex="email"
          title={t("users.fields.email", "Email")}
          render={(value) => <EmailField value={value} />}
        />
        
        <Table.Column
          key="name"
          dataIndex="name"
          title={t("users.fields.name", "Name")}
        />
        
        <Table.Column
          key="lastLogin"
          dataIndex="lastLogin"
          title={t("users.fields.lastLogin", "Last Login")}
          render={(value) => value}
          sorter
        />
        
        <Table.Column
          key="roles"
          dataIndex="roles"
          title={t("users.fields.roles", "Roles")}
          render={renderUserRoles}
        />
        
        <Table.Column<UserResponse>
          fixed="right"
          title={t("table.actions", "Actions")}
          render={(_, record) => renderTableActions(record)}
        />
      </Table>

      <CreateUserModal
        ref={createModalRef}
        onUserCreated={handleShowTicketModal}
        onRefetchTable={handleRefetchTable}
      />

      <TicketUrlModal
        visible={isTicketModalVisible}
        ticketUrl={ticketUrl}
        onClose={handleCloseTicketModal}
      />
    </List>
  );
};
