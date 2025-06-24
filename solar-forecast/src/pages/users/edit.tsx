import React, { useMemo, useCallback } from "react";
import { HttpError, useTranslate, usePermissions } from "@refinedev/core";
import {
  Edit,
  useForm,
  useSelect,
} from "@refinedev/antd";
import {
  Form,
  Select,
  Card,
  Spin,
  notification,
  Result,
} from "antd";

import {
  RoleResponse,
  UserResponse,
  UpdateUserRequest,
  RoleInfo,
} from "../../interfaces";

// Constants
const ROLES_PAGE_SIZE = 100;
const REQUIRED_PERMISSION = "user:update";

export const UserEdit: React.FC = () => {
  const t = useTranslate();

  // Check permissions
  const { data: permissions, isLoading: permissionsLoading } =
    usePermissions<string[]>();

  const canEdit = useMemo(() => 
    permissions?.includes(REQUIRED_PERMISSION), 
    [permissions]
  );

  // Form hook for fetching user data and handling updates
  const { formProps, saveButtonProps, queryResult, formLoading } = useForm<
    UserResponse,
    HttpError,
    UpdateUserRequest
  >({
    resource: "users",
    action: "edit",
    redirect: "list",
    successNotification: () => ({
      message: t("notifications.success", "Successful"),
      description: t("notifications.editSuccess", {
        resource: t("users.title", "User"),
      }),
      type: "success",
    }),
    errorNotification: (error) => {
      console.error("User update failed:", error);
      return {
        message: t("notifications.error", {
          statusCode: error?.statusCode || "unknown",
        }),
        description: t("notifications.editError", {
          resource: t("users.title", "User"),
          statusCode: error?.statusCode || "unknown",
        }),
        type: "error",
      };
    },
    onMutationError: (error) => {
      console.error("Mutation error during user update:", error);
      notification.error({
        message: t("notifications.error"),
        description: t("notifications.updateError", {
          resource: t("users.title", "User"),
        }),
      });
    },
  });

  // Fetch available roles for the Select component
  const { selectProps: roleSelectProps, queryResult: rolesQueryResult } =
    useSelect<RoleResponse>({
      resource: "roles",
      optionLabel: "name",
      optionValue: "id",
      pagination: {
        pageSize: ROLES_PAGE_SIZE,
      },
    });

  // Memoized data processing
  const userData = useMemo(() => queryResult?.data?.data, [queryResult?.data?.data]);
  
  const initialRoleIds = useMemo(
    () => userData?.roles?.map((role: RoleInfo) => role.id) || [],
    [userData?.roles]
  );

  const formInitialValues = useMemo(
    () => ({ roleIds: initialRoleIds }),
    [initialRoleIds]
  );

  // Error handlers
  const handlePermissionError = useCallback(() => {
    console.warn("User does not have permission to edit users.");
    notification.warning({
      message: t("notifications.warning"),
      description: t("notifications.noPermission", {
        action: t("common.edit", "edit"),
        resource: t("users.title", "users"),
      }),
    });
  }, [t]);

  const handleFormError = useCallback((error: any) => {
    console.error("Form error:", error);
    notification.error({
      message: t("notifications.error"),
      description: t("notifications.formError"),
    });
  }, [t]);

  // Loading states
  const isLoading = formLoading || permissionsLoading || rolesQueryResult.isLoading;

  // Permission check with user feedback
  if (permissionsLoading) {
    return (
      <Edit isLoading={true}>
        <Spin tip={t("common.loadingPermissions", "Loading permissions...")} />
      </Edit>
    );
  }

  if (!canEdit && !permissionsLoading) {
    handlePermissionError();
    return (
      <Edit>
        <Result
          status="403"
          title={t("errors.403.title", "Access Denied")}
          subTitle={t("errors.403.subTitle", "You don't have permission to edit users.")}
        />
      </Edit>
    );
  }

  // Loading state for data fetching
  if (isLoading) {
    return (
      <Edit isLoading={true}>
        <Spin tip={t("common.loading", "Loading...")} />
      </Edit>
    );
  }

  // Error state for data fetching
  if (queryResult?.isError) {
    return (
      <Edit>
        <Result
          status="error"
          title={t("errors.loadingError.title", "Loading Error")}
          subTitle={t("errors.loadingError.subTitle", "Failed to load user data.")}
        />
      </Edit>
    );
  }

  return (
    <Edit
      title={t("users.titles.edit", "Edit User")}
      saveButtonProps={{
        ...saveButtonProps,
        disabled: !canEdit || saveButtonProps.disabled,
      }}
      isLoading={formLoading}
    >
      <Card 
        title={t("users.fields.roles", "Roles")} 
        bordered={false}
      >
        <Form
          {...formProps}
          layout="vertical"
          initialValues={formInitialValues}
          onFinishFailed={handleFormError}
        >
          <Form.Item
            label={t("users.fields.roles", "Roles")}
            name="roleIds"
            rules={[
              {
                required: false,
                message: t("users.validation.rolesOptional", "Roles are optional"),
              },
            ]}
            help={t("users.help.rolesAssignment", "Select one or more roles to assign to this user")}
          >
            <Select
              mode="multiple"
              placeholder={t("users.placeholders.selectRoles", "Assign roles")}
              {...roleSelectProps}
              loading={rolesQueryResult.isLoading}
              disabled={!canEdit}
              style={{ width: "100%" }}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Card>
    </Edit>
  );
};
