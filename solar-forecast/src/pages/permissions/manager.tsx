import React, { useEffect, useCallback, useMemo } from "react";
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
  notification,
  Result,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  PermissionResponse,
  UpdatePermissionsRequest,
} from "../../interfaces/index.d"; // Adjust path
import { useTranslation } from "react-i18next";

const { Title } = Typography;

// Constants
const FORM_FIELD_WIDTH = 300;
const CARD_MIN_HEIGHT = 200;

interface FormValues {
  permissions: PermissionResponse[];
}

export const PermissionManager: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const notificationProvider = useNotificationProvider();
  const notify = notificationProvider.open;
  const go = useGo();
  const { t } = useTranslation();

  // Fetch initial list of permissions
  const {
    data: initialData,
    isLoading,
    error,
    refetch,
  } = useList<PermissionResponse>({
    resource: "permissions",
    pagination: {
      mode: "off", // Fetch all
    },
  });

  // Memoized permissions list
  const permissionsList = useMemo(() => {
    if (!initialData?.data) return [];
    return Array.isArray(initialData.data) ? initialData.data : [];
  }, [initialData?.data]);

  // Mutation hook for updating permissions
  const { mutate, isLoading: isSaving } = useUpdate<UpdatePermissionsRequest>({
    successNotification: () => ({
      message: t("notifications.success"),
      description: t("notifications.editSuccess", {
        resource: t("permissions.title", "Permissions"),
      }),
      type: "success",
    }),
    errorNotification: false, // Handle errors manually
  });

  // Effect to set form fields once initial data is loaded
  useEffect(() => {
    if (permissionsList.length > 0) {
      form.setFieldsValue({ permissions: permissionsList });
    }
  }, [permissionsList, form]);

  // Error handlers
  const handleFetchError = useCallback(() => {
    console.error("Failed to fetch permissions:", error);
    notification.error({
      message: t("notifications.error"),
      description: t("notifications.fetchError"),
    });
  }, [error, t]);

  const handleUpdateError = useCallback((updateError: any) => {
    console.error("Error updating permissions:", updateError);
    
    const errorMessage = updateError?.message || t("notifications.updateError", {
      resource: t("permissions.title", "Permissions"),
    });
    
    notification.error({
      message: t("notifications.error", {
        statusCode: updateError?.statusCode || "unknown",
      }),
      description: errorMessage,
    });
  }, [t]);

  const handleUpdateSuccess = useCallback(() => {
    try {
      refetch();
    } catch (refetchError) {
      console.error("Failed to refetch permissions after update:", refetchError);
    }
  }, [refetch]);

  // Form handlers
  const handleFinish = useCallback((values: FormValues) => {
    try {
      if (!values.permissions || values.permissions.length === 0) {
        notification.warning({
          message: t("notifications.warning"),
          description: t("permissions.warnings.noPermissions", "At least one permission is required"),
        });
        return;
      }

      // Validate permissions data
      const hasInvalidPermissions = values.permissions.some(
        (p) => !p.permissionName?.trim() || !p.description?.trim()
      );

      if (hasInvalidPermissions) {
        notification.error({
          message: t("notifications.error"),
          description: t("notifications.formError"),
        });
        return;
      }

      const payload: UpdatePermissionsRequest = {
        permissions: values.permissions.map((p) => ({
          permissionName: p.permissionName.trim(),
          description: p.description.trim(),
        })),
      };

      mutate(
        {
          resource: "permissions",
          id: "",
          values: payload,
        },
        {
          onSuccess: handleUpdateSuccess,
          onError: handleUpdateError,
        }
      );
    } catch (formError) {
      console.error("Form submission error:", formError);
      notification.error({
        message: t("notifications.error"),
        description: t("notifications.formError"),
      });
    }
  }, [mutate, handleUpdateSuccess, handleUpdateError, t]);




  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <Spin 
          tip={t("common.loadingPermissions", "Loading permissions...")}
          style={{ minHeight: CARD_MIN_HEIGHT }}
        >
          <div style={{ height: CARD_MIN_HEIGHT }} />
        </Spin>
      </Card>
    );
  }

  // Render error state
  if (error) {
    handleFetchError();
    return (
      <Card>
        <Result
          status="error"
          title={t("errors.loadingError.title", "Loading Error")}
          subTitle={t("errors.loadingError.subTitle", "Failed to load permissions data.")}
          extra={
            <Button type="primary" onClick={() => refetch()}>
              {t("buttons.refresh", "Refresh")}
            </Button>
          }
        />
      </Card>
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
        style={{ marginBottom: 20 }}
      />
      
      <Form
        form={form}
        name="dynamic_permissions_form"
        onFinish={handleFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.List name="permissions">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ 
                    display: "flex", 
                    marginBottom: 16,
                    width: "100%",
                    alignItems: "flex-start",
                  }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "permissionName"]}
                    label={name === 0 ? t("permissions.fields.name", "Permission Name") : undefined}
                    rules={[
                      {
                        required: true,
                        message: t(
                          "permissions.fields.missingName",
                          "Missing permission name"
                        ),
                      },
                      {
                        pattern: /^[a-zA-Z0-9_:\-]+$/,
                        message: t(
                          "permissions.validation.nameFormat",
                          "Permission name can only contain letters, numbers, underscores, colons, and hyphens"
                        ),
                      },
                    ]}
                    style={{ width: FORM_FIELD_WIDTH }}
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
                    label={name === 0 ? t("permissions.fields.description", "Description") : undefined}
                    rules={[
                      {
                        required: true,
                        message: t(
                          "permissions.fields.missingDescription",
                          "Missing description"
                        ),
                      },
                      {
                        min: 3,
                        message: t(
                          "permissions.validation.descriptionLength",
                          "Description must be at least 3 characters"
                        ),
                      },
                    ]}
                    style={{ flex: 1, minWidth: 200 }}
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
                    okText={t("common.yes", "Yes")}
                    cancelText={t("buttons.cancel", "Cancel")}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      style={{ marginTop: name === 0 ? 30 : 0 }}
                      aria-label={t("permissions.actions.removePermission", "Remove permission")}
                    />
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
        
        <Form.Item style={{ marginTop: 24 }}>
          <Popconfirm
            title={t(
              "permissions.actions.updateConfirmTitle",
              "Confirm Permission Update"
            )}
            description={t(
              "permissions.actions.updateConfirmDesc",
              "Are you sure you want to replace all system permissions with this list?"
            )}
            onConfirm={() => form.submit()}
            okText={t(
              "permissions.actions.updateConfirmOk",
              "Yes, Replace All"
            )}
            cancelText={t("buttons.cancel", "Cancel")}
          >
            <Button 
              type="primary" 
              htmlType="button" 
              loading={isSaving}
              size="large"
            >
              {t("permissions.actions.saveAll", "Save All Permissions")}
            </Button>
          </Popconfirm>
        </Form.Item>
      </Form>
    </Card>
  );
};
