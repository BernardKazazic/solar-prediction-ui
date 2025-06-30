import React, { useCallback, useMemo } from "react";
import { useList, HttpError } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Spin, Alert, notification, Result } from "antd";
import { useTranslation } from "react-i18next";

import {
  RoleResponse,
  PermissionResponse,
  UpdateRoleRequest,
} from "../../interfaces/index.d";

// Constants
const DESCRIPTION_ROWS = 4;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;
const DESCRIPTION_MIN_LENGTH = 5;
const DESCRIPTION_MAX_LENGTH = 255;
const PERMISSIONS_PAGE_SIZE = 100;

export const RoleEdit: React.FC = () => {
  const { t } = useTranslation();
  
  const { formProps, saveButtonProps, queryResult, formLoading } = useForm<
    RoleResponse,
    HttpError,
    UpdateRoleRequest
  >({
    resource: "roles",
    action: "edit",
    redirect: "list",
    successNotification: () => ({
      message: t("notifications.success"),
      description: t("notifications.editSuccess", {
        resource: t("roles.title", "Role"),
      }),
      type: "success",
    }),
    errorNotification: false, // Handle errors manually
    onMutationError: (error) => {
      console.error("Role update failed:", error);
      notification.error({
        message: t("notifications.error"),
        description: t("notifications.updateError", {
          resource: t("roles.title", "Role"),
        }),
      });
    },
  });

  // Fetch all available permissions
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = useList<PermissionResponse>({
    resource: "permissions",
    pagination: {
      mode: "off",
    },
  });

  // Memoized field labels
  const fieldLabels = useMemo(() => ({
    id: t("roles.fields.id", "ID"),
    name: t("roles.fields.name", "Name"),
    description: t("roles.fields.description", "Description"),
    permissions: t("roles.fields.permissions", "Permissions"),
  }), [t]);

  // Memoized validation rules
  const validationRules = useMemo(() => ({
    name: [
      {
        required: true,
        message: t("roles.validation.nameRequired", "Please input the role name!"),
      },
      {
        min: NAME_MIN_LENGTH,
        message: t("roles.validation.nameMinLength", `Name must be at least ${NAME_MIN_LENGTH} characters`),
      },
      {
        max: NAME_MAX_LENGTH,
        message: t("roles.validation.nameMaxLength", `Name must not exceed ${NAME_MAX_LENGTH} characters`),
      },
      {
        pattern: /^[a-zA-Z0-9\s\-_]+$/,
        message: t("roles.validation.nameFormat", "Name can only contain letters, numbers, spaces, hyphens, and underscores"),
      },
    ],
    description: [
      {
        required: true,
        message: t("roles.validation.descriptionRequired", "Please input the role description!"),
      },
      {
        min: DESCRIPTION_MIN_LENGTH,
        message: t("roles.validation.descriptionMinLength", `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`),
      },
      {
        max: DESCRIPTION_MAX_LENGTH,
        message: t("roles.validation.descriptionMaxLength", `Description must not exceed ${DESCRIPTION_MAX_LENGTH} characters`),
      },
    ],
  }), [t]);

  // Memoized permission options
  const permissionOptions = useMemo(() => {
    const allPermissions = permissionsData?.data;
    if (!Array.isArray(allPermissions)) return [];
    
    return allPermissions.map((permission) => ({
      label: `${permission.permissionName} (${permission.description})`,
      value: permission.permissionName,
    }));
  }, [permissionsData?.data]);

  // Error handlers
  const handlePermissionsError = useCallback(() => {
    console.error("Failed to load permissions:", permissionsError);
    notification.error({
      message: t("notifications.error"),
      description: t("notifications.fetchError"),
    });
  }, [permissionsError, t]);

  const handleFormFinishFailed = useCallback((errorInfo: any) => {
    console.error("Form validation failed:", errorInfo);
    notification.error({
      message: t("notifications.error"),
      description: t("notifications.formError"),
    });
  }, [t]);

  const handleRefetchTable = useCallback(() => {
    try {
      queryResult?.refetch();
    } catch (error) {
      console.error("Failed to refetch role data:", error);
    }
  }, [queryResult]);

  // Loading state for form data
  if (formLoading) {
    return (
      <Edit isLoading={true}>
        <Spin tip={t("common.loading", "Loading...")} />
      </Edit>
    );
  }

  // Error state for form data
  if (queryResult?.isError) {
    return (
      <Edit>
        <Result
          status="error"
          title={t("errors.loadingError.title", "Loading Error")}
          subTitle={t("errors.loadingError.subTitle", "Failed to load role data.")}
        />
      </Edit>
    );
  }

  return (
    <Edit 
      saveButtonProps={{
        ...saveButtonProps,
        loading: formLoading,
      }}
      title={t("roles.titles.edit", "Edit Role")}
    >
      <Form 
        {...formProps} 
        layout="vertical"
        onFinishFailed={handleFormFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label={fieldLabels.id}
          name="id"
        >
          <Input 
            disabled 
            style={{ backgroundColor: '#f5f5f5' }}
          />
        </Form.Item>
        
        <Form.Item
          label={fieldLabels.name}
          name="name"
          rules={validationRules.name}
          hasFeedback
        >
          <Input 
            placeholder={t("roles.placeholders.name", "Enter role name")}
            maxLength={NAME_MAX_LENGTH}
            showCount
          />
        </Form.Item>
        
        <Form.Item
          label={fieldLabels.description}
          name="description"
          rules={validationRules.description}
          hasFeedback
        >
          <Input.TextArea 
            rows={DESCRIPTION_ROWS}
            placeholder={t("roles.placeholders.description", "Enter role description")}
            maxLength={DESCRIPTION_MAX_LENGTH}
            showCount
          />
        </Form.Item>
        
        <Form.Item
          label={fieldLabels.permissions}
          name="permissions"
          help={
            permissionsError 
              ? t("roles.errors.permissionsLoadFailed", "Error loading permissions")
              : t("roles.help.permissionsSelect", "Select permissions to assign to this role")
          }
          validateStatus={permissionsError ? "error" : undefined}
        >
          {permissionsLoading ? (
            <Spin tip={t("common.loadingPermissions", "Loading permissions...")} />
          ) : permissionsError ? (
            <Alert
              message={t("roles.errors.permissionsLoadFailed", "Error loading permissions")}
              description={permissionsError.message}
              type="error"
              showIcon
                             action={
                 <button 
                   type="button" 
                   onClick={() => refetchPermissions()}
                   style={{ 
                     fontSize: '12px', 
                     padding: '4px 8px',
                     border: '1px solid #d9d9d9',
                     borderRadius: '4px',
                     background: '#fff',
                     cursor: 'pointer'
                   }}
                 >
                   {t("buttons.refresh", "Refresh")}
                 </button>
               }
            />
          ) : (
            <Select
              mode="multiple"
              allowClear
              showSearch
              style={{ width: "100%" }}
              placeholder={t("roles.placeholders.permissions", "Select permissions")}
              options={permissionOptions}
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              disabled={permissionOptions.length === 0}
              notFoundContent={
                permissionOptions.length === 0 
                  ? t("roles.noPermissionsAvailable", "No permissions available")
                  : t("common.notFound", "Not found")
              }
            />
          )}
        </Form.Item>
      </Form>
    </Edit>
  );
};
