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
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Extend dayjs with the necessary plugins
dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

// Define interfaces based on backend DTOs
interface UserResponse extends BaseRecord {
  userId: string;
  email: string;
  name: string;
  picture: string;
  lastLogin: string; // Consider using Date type if appropriate after fetching
  roles: string[];
}

interface CreateUserRequest {
  email: string;
  connection: string;
  roleIds: string[];
}

// Type for the expected response from the create operation
interface CreateUserResponse {
  temporaryPassword: string;
}

// Hardcoded role options (replace with dynamic fetching if needed)
const roleOptions = [
  { label: "Admin Role", value: "rol_RTt5iKN7IbiWbDvP" }, // Replace with actual Role IDs from Auth0
  { label: "User Role", value: "rol_UsCp5rjG4QwcyczU" }, // Replace with actual Role IDs from Auth0
];

// Define connection options
const connectionOptions = [
  {
    label: "Username-Password-Authentication",
    value: "Username-Password-Authentication",
  },
  // Add other connection types here in the future if needed
];

// New component for displaying the temporary password
interface PasswordDisplayModalProps {
  visible: boolean;
  password?: string;
  onClose: () => void;
}

const PasswordDisplayModal: React.FC<PasswordDisplayModalProps> = ({
  visible,
  password,
  onClose,
}) => {
  const t = useTranslate();

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      message.success(t("users.tempPassword.copySuccess"));
    } else {
      message.error(t("users.tempPassword.copyError"));
    }
  };

  return (
    <Modal
      title={t("users.tempPassword.title")}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          {t("buttons.close", "Close")}
        </Button>,
      ]}
      maskClosable={false}
      keyboard={false}
      closable={true}
    >
      <Alert
        message={t("users.tempPassword.warningTitle")}
        description={
          <>
            <Typography.Paragraph>
              {t("users.tempPassword.warningDesc")}
            </Typography.Paragraph>
            <Typography.Paragraph>
              {t("users.tempPassword.validityDesc")}
            </Typography.Paragraph>
          </>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Typography.Paragraph strong>
        {t("users.tempPassword.passwordLabel")}
      </Typography.Paragraph>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Typography.Text
          code
          style={{ fontSize: "1.1em", wordBreak: "break-all" }}
        >
          {password || "N/A"}
        </Typography.Text>
        <Button
          icon={<CopyOutlined />}
          onClick={handleCopy}
          disabled={!password}
        >
          {t("buttons.copy")}
        </Button>
      </Space>
    </Modal>
  );
};

export const UserList: React.FC = () => {
  const t = useTranslate();
  const { token } = theme.useToken();

  // State for the password display modal
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<
    string | undefined
  >(undefined);

  const showPasswordModal = (password: string) => {
    setTemporaryPassword(password);
    setIsPasswordModalVisible(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalVisible(false);
    setTemporaryPassword(undefined);
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
    CreateUserResponse
  >({
    action: "create",
    resource: "users",
    redirect: false,
    onMutationSuccess: (data, variables, context) => {
      if (
        data?.data &&
        typeof data.data === "object" &&
        "temporaryPassword" in data.data &&
        typeof (data.data as any).temporaryPassword === "string"
      ) {
        const password = (data.data as CreateUserResponse).temporaryPassword;
        showPasswordModal(password);
        tableQueryResult.refetch();
      } else {
        console.error(
          "Unexpected response structure in onMutationSuccess:",
          data
        );
        notification.error({
          message: t("users.tempPassword.fetchErrorTitle", "Password Error"),
          description: t(
            "users.tempPassword.fetchErrorDesc",
            "Failed to retrieve the temporary password after user creation."
          ),
        });
      }
    },
  });

  // Define the expected input format for lastLogin
  const lastLoginInputFormat = "ddd MMM DD HH:mm:ss z YYYY"; // Adjust 'z' if CEST parsing fails

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
        rowKey="userId" // Use userId as the row key
        scroll={{ x: true }}
        // Optional: Customize pagination display if needed
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
          render={(value) => {
            if (!value) {
              return "-"; // Keep this for null/undefined values
            }
            // Attempt to parse the date with the specific format
            const parsedDate = dayjs(value, lastLoginInputFormat);
            if (parsedDate.isValid()) {
              // If parsing is successful, format it
              return parsedDate.format("YYYY-MM-DD HH:mm:ss");
            } else {
              // If parsing fails, return the original value (will likely show 'Invalid Date')
              // You could log an error here for debugging: console.error('Failed to parse date:', value);
              return value; // Revert back to showing original value
            }
          }}
          sorter // Enable sorting if backend supports it via data provider
        />
        <Table.Column
          key="roles"
          dataIndex="roles"
          title={t("users.fields.roles", "Roles")}
          render={(roles: string[]) => (
            <>
              {roles?.map((role) => (
                // Assuming roles are strings; adjust if they are objects
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
              {/* Edit/Show buttons removed as per requirement */}
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.userId} // Use userId
                disabled={!canDelete} // Disable based on permission
                invalidates={[]} // Prevent automatic list invalidation/refetch
                onSuccess={() => {
                  // Explicitly refetch after successful pessimistic delete
                  // Add a delay before refetching to allow backend processing
                  setTimeout(() => {
                    tableQueryResult.refetch();
                  }, 500); // Delay of 500 milliseconds (0.5 second)
                }}
                // meta={{ dataProviderName: "default" }} // Pass meta if needed
              />
            </Space>
          )}
        />
      </Table>

      {/* Create User Modal */}
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
            initialValue="Username-Password-Authentication" // Default connection
            rules={[
              {
                required: true,
                message: t("validation.required", "Connection is required"),
              },
            ]}
          >
            <Select
              options={connectionOptions}
              // disabled // Consider disabling if only one option exists
            />
          </Form.Item>
          <Form.Item
            label={t("users.fields.roles", "Roles")}
            name="roleIds"
            // Add rules if needed, e.g., rules={[{ required: true }]} if at least one role is mandatory
          >
            <Select
              mode="multiple"
              placeholder={t("users.placeholders.selectRoles", "Assign roles")}
              options={roleOptions}
              loading={tableQueryResult.isLoading} // Example: reuse table loading state, or fetch roles separately
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Display Modal */}
      <PasswordDisplayModal
        visible={isPasswordModalVisible}
        password={temporaryPassword}
        onClose={closePasswordModal}
      />
    </List>
  );
};
