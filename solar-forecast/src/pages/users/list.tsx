import React, { useState } from "react";
import {
  useTranslate,
  HttpError,
  usePermissions,
  useList,
} from "@refinedev/core";
import {
  List,
  useTable,
  DeleteButton,
  CreateButton,
  useModalForm,
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
  Modal,
  Form,
  Input,
  Select,
  notification,
} from "antd";
import { UserOutlined } from "@ant-design/icons";

import {
  UserResponse,
  CreateUserRequest,
  CreateUserTicketResponse,
  IRoleResponse,
  RoleInfo,
} from "../../interfaces";

// Import the new modal component
import { TicketUrlModal } from "../../components/users/TicketUrlModal";
// Import the date formatting utility
import { formatLastLogin } from "../../utils/dateUtils";

// Hardcoded connection options
const connectionOptions = [
  {
    label: "Username-Password-Authentication",
    value: "Username-Password-Authentication",
  },
  // Add other connection types here in the future if needed
];

export const UserList: React.FC = () => {
  const t = useTranslate();
  const { token } = theme.useToken();

  // State for the ticket URL modal
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [ticketUrl, setTicketUrl] = useState<string | undefined>(undefined);

  const showTicketModal = (url: string) => {
    setTicketUrl(url);
    setIsTicketModalVisible(true);
  };

  const closeTicketModal = () => {
    setIsTicketModalVisible(false);
    setTicketUrl(undefined);
  };

  const { data: rolesData, isLoading: rolesLoading } = useList<IRoleResponse>({
    resource: "roles",
    pagination: {
      pageSize: 100,
    },
  });

  const dynamicRoleOptions =
    rolesData?.data?.map((role) => ({
      label: role.name,
      value: role.id,
    })) || [];

  // Table hook
  const { tableProps, tableQueryResult } = useTable<UserResponse, HttpError>({
    resource: "users",
    syncWithLocation: true,
  });

  // Modal form hook for creating users
  const { modalProps, formProps, show, formLoading } = useModalForm<
    CreateUserRequest,
    HttpError,
    CreateUserTicketResponse
  >({
    action: "create",
    resource: "users",
    redirect: false,
    successNotification: () => ({
      message: t("notifications.success"),
      description: t("notifications.createUserSuccessSingular"),
      type: "success",
    }),
    onMutationSuccess: (data, variables, context) => {
      if (
        data?.data &&
        typeof data.data === "object" &&
        "ticketUrl" in data.data &&
        typeof (data.data as CreateUserTicketResponse).ticketUrl === "string"
      ) {
        const url = (data.data as CreateUserTicketResponse).ticketUrl;
        showTicketModal(url);
        tableQueryResult.refetch();
      } else {
        console.error(
          "Unexpected response structure in onMutationSuccess (expecting ticketUrl):",
          data
        );
        notification.error({
          message: t("users.ticketUrl.fetchErrorTitle"),
          description: t("users.ticketUrl.fetchErrorDesc"),
        });
      }
    },
  });

  return (
    <List
      headerButtons={[
        <CreateButton key="create-user" onClick={() => show()}>
          {t("users.actions.invite", "Invite User")}
        </CreateButton>,
      ]}
    >
      <Table {...tableProps} rowKey="userId" scroll={{ x: true }}>
        <Table.Column
          dataIndex="picture"
          title={t("users.fields.avatar.label", "Avatar")}
          render={(value) => (
            <Avatar src={value} icon={<UserOutlined />} alt="User Avatar" />
          )}
          width={80}
          align="center"
        />
        <Table.Column
          key="userId"
          dataIndex="userId"
          title={t("users.fields.id", "ID")}
          render={(value) => (
            <Typography.Text style={{ whiteSpace: "nowrap" }}>
              {value}
            </Typography.Text>
          )}
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
          render={(value) => formatLastLogin(value)}
          sorter
        />
        <Table.Column
          key="roles"
          dataIndex="roles"
          title={t("users.fields.roles", "Roles")}
          render={(roles: RoleInfo[]) => (
            <>
              {roles?.map((role) => (
                <TagField
                  key={role.id}
                  value={role.name}
                  style={{ margin: "2px" }}
                />
              ))}
            </>
          )}
        />
        <Table.Column<UserResponse>
          fixed="right"
          title={t("table.actions", "Actions")}
          render={(_, record) => (
            <Space>
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.userId}
                invalidates={[]}
                successNotification={() => ({
                  message: t("notifications.success"),
                  description: t("notifications.deleteUserSuccessSingular"),
                  type: "success",
                })}
                onSuccess={() => {
                  setTimeout(() => {
                    tableQueryResult.refetch();
                  }, 2000);
                }}
              />
              <EditButton hideText size="small" recordItemId={record.userId} />
            </Space>
          )}
        />
      </Table>

      <Modal
        {...modalProps}
        title={t("users.actions.invite", "Invite New User")}
      >
        <Form {...formProps} layout="vertical">
          <Form.Item
            label={t("users.fields.email", "Email")}
            name="email"
            rules={[
              {
                required: true,
                message: t("validation.required", "Email is required"),
              },
              {
                type: "email",
                message: t("validation.email", "Invalid email format"),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t("users.fields.connection", "Connection")}
            name="connection"
            initialValue="Username-Password-Authentication"
            rules={[
              {
                required: true,
                message: t("validation.required", "Connection is required"),
              },
            ]}
          >
            <Select options={connectionOptions} />
          </Form.Item>
          <Form.Item label={t("users.fields.roles", "Roles")} name="roleIds">
            <Select
              mode="multiple"
              placeholder={t("users.placeholders.selectRoles", "Assign roles")}
              options={dynamicRoleOptions}
              loading={rolesLoading}
            />
          </Form.Item>
        </Form>
      </Modal>

      <TicketUrlModal
        visible={isTicketModalVisible}
        ticketUrl={ticketUrl}
        onClose={closeTicketModal}
      />
    </List>
  );
};
