import React, { useState, useEffect } from "react";
import { useList, useUpdate, useGo } from "@refinedev/core";
import { useNotificationProvider } from "@refinedev/antd";
import {
  Form,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Spin,
  Alert,
  Popconfirm,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  IPermissionResponse,
  IUpdatePermissionsRequest,
} from "../../interfaces/index.d"; // Adjust path

const { Title } = Typography;

export const PermissionManager: React.FC = () => {
  const [form] = Form.useForm();
  const notificationProvider = useNotificationProvider();
  const notify = notificationProvider.open;
  const go = useGo();

  // Fetch initial list of permissions
  const {
    data: initialData,
    isLoading,
    error,
  } = useList<IPermissionResponse>({
    resource: "permissions",
    pagination: {
      mode: "off", // Fetch all
    },
  });

  // Mutation hook for updating permissions
  const { mutate, isLoading: isSaving } =
    useUpdate<IUpdatePermissionsRequest>();

  // Effect to set form fields once initial data is loaded
  useEffect(() => {
    if (initialData?.data) {
      // Ensure data is in the expected format (array)
      const permissionsList = Array.isArray(initialData.data)
        ? initialData.data
        : [];
      form.setFieldsValue({ permissions: permissionsList });
    }
  }, [initialData, form]);

  const onFinish = (values: { permissions: IPermissionResponse[] }) => {
    const payload: IUpdatePermissionsRequest = {
      permissions: values.permissions.map((p) => ({
        // Ensure structure matches API
        permissionName: p.permissionName,
        description: p.description,
      })),
    };

    mutate(
      {
        resource: "permissions",
        id: "", // PUT /permissions doesn't need an ID in the path
        values: payload,
      },
      {
        onSuccess: () => {
          notify?.({
            type: "success",
            message: "Permissions updated successfully",
            description: "The list of system permissions has been replaced.",
          });
          // Optionally refetch or navigate
          // go({ to: '/some/path', type: 'replace' });
        },
        onError: (error) => {
          console.error("Error updating permissions:", error);
          notify?.({
            type: "error",
            message: "Error updating permissions",
            description: error.message || "An unexpected error occurred.",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Spin tip="Loading permissions...">
        <Card>
          <div style={{ height: "200px" }} />
        </Card>
      </Spin>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading permissions"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <Card title="Manage System Permissions">
      <Alert
        message="Warning: Saving replaces all permissions"
        description="Submitting this form will overwrite the entire list of system permissions with the content below. Ensure all required permissions are included."
        type="warning"
        showIcon
        style={{ marginBottom: "20px" }}
      />
      <Form
        form={form}
        name="dynamic_permissions_form"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.List name="permissions">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "permissionName"]}
                    rules={[
                      { required: true, message: "Missing permission name" },
                    ]}
                    style={{ width: "300px" }}
                  >
                    <Input placeholder="Permission Name (e.g., read:users)" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "description"]}
                    rules={[{ required: true, message: "Missing description" }]}
                    style={{ flexGrow: 1 }}
                  >
                    <Input placeholder="Description" />
                  </Form.Item>
                  <Popconfirm
                    title="Are you sure you want to remove this permission?"
                    onConfirm={() => remove(name)}
                  >
                    <MinusCircleOutlined style={{ color: "red" }} />
                  </Popconfirm>
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Permission
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Popconfirm
            title="Confirm Permission Update"
            description="Are you sure you want to replace all system permissions with this list?"
            onConfirm={form.submit} // Trigger form onFinish
            okText="Yes, Replace All"
            cancelText="Cancel"
          >
            <Button type="primary" htmlType="button" loading={isSaving}>
              Save All Permissions
            </Button>
          </Popconfirm>
        </Form.Item>
      </Form>
    </Card>
  );
};
