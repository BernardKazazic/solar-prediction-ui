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
  PermissionResponse,
  UpdatePermissionsRequest,
} from "../../interfaces/index.d"; // Adjust path
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export const PermissionManager: React.FC = () => {
  const [form] = Form.useForm();
  const notificationProvider = useNotificationProvider();
  const notify = notificationProvider.open;
  const go = useGo();
  const { t } = useTranslation();

  // Fetch initial list of permissions
  const {
    data: initialData,
    isLoading,
    error,
  } = useList<PermissionResponse>({
    resource: "permissions",
    pagination: {
      mode: "off", // Fetch all
    },
  });

  // Mutation hook for updating permissions
  const { mutate, isLoading: isSaving } = useUpdate<UpdatePermissionsRequest>({
    successNotification: () => ({
      message: t("notifications.editSuccess", {
        resource: t("permissions.title", "Permissions"),
      }),
      type: "success",
    }),
  });

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

  const onFinish = (values: { permissions: PermissionResponse[] }) => {
    const payload: UpdatePermissionsRequest = {
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
        onError: (error) => {
          console.error("Error updating permissions:", error);
          notify?.({
            type: "error",
            message: t("notifications.error", {
              statusCode: error?.statusCode || "unknown",
            }),
            description: t("notifications.editError", {
              resource: t("permissions.title", "Permissions"),
              statusCode: error?.statusCode || "unknown",
            }),
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
    <Card title={t("permissions.manageTitle", "Manage System Permissions")}>
      <Alert
        message={t(
          "permissions.warnings.replaceAllTitle",
          "Warning: Saving replaces all permissions"
        )}
        description={t(
          "permissions.warnings.replaceAllDesc",
          "Submitting this form will overwrite the entire list of system permissions with the content below. Ensure all required permissions are included."
        )}
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
                      {
                        required: true,
                        message: t(
                          "permissions.fields.missingName",
                          "Missing permission name"
                        ),
                      },
                    ]}
                    style={{ width: "300px" }}
                  >
                    <Input
                      placeholder={t(
                        "permissions.fields.namePlaceholder",
                        "Permission Name (e.g., read:users)"
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "description"]}
                    rules={[
                      {
                        required: true,
                        message: t(
                          "permissions.fields.missingDescription",
                          "Missing description"
                        ),
                      },
                    ]}
                    style={{ flexGrow: 1 }}
                  >
                    <Input
                      placeholder={t(
                        "permissions.fields.descriptionPlaceholder",
                        "Description"
                      )}
                    />
                  </Form.Item>
                  <Popconfirm
                    title={t(
                      "permissions.actions.removeConfirmTitle",
                      "Are you sure you want to remove this permission?"
                    )}
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
                  {t("permissions.actions.add", "Add Permission")}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Popconfirm
            title={t(
              "permissions.actions.updateConfirmTitle",
              "Confirm Permission Update"
            )}
            description={t(
              "permissions.actions.updateConfirmDesc",
              "Are you sure you want to replace all system permissions with this list?"
            )}
            onConfirm={form.submit}
            okText={t(
              "permissions.actions.updateConfirmOk",
              "Yes, Replace All"
            )}
            cancelText={t("buttons.cancel", "Cancel")}
          >
            <Button type="primary" htmlType="button" loading={isSaving}>
              {t("permissions.actions.saveAll", "Save All Permissions")}
            </Button>
          </Popconfirm>
        </Form.Item>
      </Form>
    </Card>
  );
};
