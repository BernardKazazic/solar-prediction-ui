import React, { useState } from "react";
import {
  useTranslate,
  HttpError,
  usePermissions,
  BaseRecord,
  CreateResponse,
} from "@refinedev/core";
import {
  List,
  useTable,
  DeleteButton,
  CreateButton,
  useModalForm,
  TagField,
  EmailField,
} from "@refinedev/antd";
import {
  Table,
  Avatar,
  Typography,
  theme,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Alert,
  message,
  notification,
} from "antd";
import { UserOutlined, CopyOutlined } from "@ant-design/icons";

// Import shared types
import {
  UserResponse,
  CreateUserRequest,
  CreateUserTicketResponse,
} from "../../interfaces";

// Import the new modal component
import { TicketUrlModal } from "../../components/users/TicketUrlModal";
// Import the date formatting utility
import { formatLastLogin } from "../../utils/dateUtils";

// Hardcoded role options (Keep comment explaining potential replacement)
const roleOptions = [
  { label: "Admin Role", value: "rol_RTt5iKN7IbiWbDvP" }, // Replace with actual Role IDs from Auth0
  { label: "User Role", value: "rol_UsCp5rjG4QwcyczU" }, // Replace with actual Role IDs from Auth0
];

// Hardcoded connection options (Keep comment about future extension)
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

  // Check permissions
  const { data: permissions } = usePermissions<string[]>();
  const canCreate = permissions?.includes("user:create");
  const canDelete = permissions?.includes("user:delete");

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
        <CreateButton
          key="create-user"
          onClick={() => show()}
          disabled={!canCreate}
        >
          {t("users.actions.invite", "Invite User")}
        </CreateButton>,
      ]}
    >
      <Table
        {...tableProps}
        rowKey="userId"
        scroll={{ x: true }}
        // pagination={{
        //   ...tableProps.pagination,
        //   showTotal: (total) => (
        //     <PaginationTotal total={total} entityName="users" />
        //   ),
        // }}
      >
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
          render={(roles: string[]) => (
            <>
              {roles?.map((role) => (
                <TagField key={role} value={role} style={{ margin: "2px" }} />
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
                disabled={!canDelete}
                invalidates={[]}
                onSuccess={() => {
                  setTimeout(() => {
                    tableQueryResult.refetch();
                  }, 500);
                }}
              />
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
            <Select
              options={connectionOptions}
            />
          </Form.Item>
          <Form.Item
            label={t("users.fields.roles", "Roles")}
            name="roleIds"
          >
            <Select
              mode="multiple"
              placeholder={t("users.placeholders.selectRoles", "Assign roles")}
              options={roleOptions}
              loading={tableQueryResult.isLoading}
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
