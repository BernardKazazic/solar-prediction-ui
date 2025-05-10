import React from "react";
import { HttpError, useTranslate, usePermissions } from "@refinedev/core";
import {
  Edit, // Use Edit component for the page structure
  useForm, // Use useForm for data fetching and mutation
  useSelect, // Use useSelect to fetch roles
} from "@refinedev/antd";
import {
  Form,
  Select,
  Card, // Use Card for better layout
  Spin, // Show spinner while loading
} from "antd";
import {
  IRoleResponse,
  UserResponse, // Use UserResponse instead of IUser
  UpdateUserRequest, // Import the new type
  RoleInfo, // Import the new RoleInfo type
} from "../../interfaces";

export const UserEdit: React.FC = () => {
  const t = useTranslate();

  // Check permissions
  const { data: permissions, isLoading: permissionsLoading } =
    usePermissions<string[]>();
  const canEdit = permissions?.includes("user:update");

  // Form hook for fetching user data and handling updates
  const { formProps, saveButtonProps, queryResult, formLoading } = useForm<
    UserResponse, // Correct type for fetched data
    HttpError,
    UpdateUserRequest // Correct type for update request payload
  >({
    resource: "users",
    action: "edit", // Specify 'edit' action
    redirect: "list", // Redirect to list page on success
    meta: {
      // If your data provider needs specific meta for the PUT request
      // method: "put" // Example if needed, depends on provider implementation
    },
    successNotification: () => ({
      message: t("notifications.success", "Successful"),
      description: t(
        "notifications.editUserSuccessSingular",
        "Successfully edited user"
      ),
      type: "success",
    }),
    errorNotification: (error) => ({
      message: t("notifications.error", {
        statusCode: error?.statusCode || "unknown",
      }),
      description: t(
        "notifications.editUserErrorSingular",
        "Error editing user"
      ), // Assuming a general edit error message exists or add a specific one
      type: "error",
    }),
  });

  // Fetch available roles for the Select component
  const { selectProps: roleSelectProps, queryResult: rolesQueryResult } =
    useSelect<IRoleResponse>({
      // Keep IRoleResponse for fetching options
      resource: "roles",
      optionLabel: "name",
      optionValue: "id",
      pagination: {
        pageSize: 100, // Fetch a reasonable number of roles
      },
      // defaultValue removed, we'll use form's initialValues
    });

  const userData = queryResult?.data?.data;

  // Prepare initial values for the form
  const initialRoleIds =
    userData?.roles?.map((role: RoleInfo) => role.id) || [];
  const formInitialValues = {
    roleIds: initialRoleIds,
  };

  // Show loading spinner while fetching data or permissions
  if (formLoading || permissionsLoading || rolesQueryResult.isLoading) {
    return (
      <Edit isLoading={true}>
        <Spin />
      </Edit>
    );
  }

  // Optionally: Show an access denied message or redirect
  if (!canEdit) {
    // Handle lack of permission - redirect or show message
    // For now, just disable the form essentially via saveButtonProps being disabled later
    // You might want a more explicit UI message here.
    console.warn("User does not have permission to edit users.");
    // Consider redirecting or showing an Ant Design Result component for unauthorized access
  }

  return (
    <Edit
      title={t("users.titles.edit", "Edit User")} // Add title translation
      saveButtonProps={{
        ...saveButtonProps,
        disabled: !canEdit || saveButtonProps.disabled, // Disable save if no permission or form invalid
      }}
      isLoading={formLoading}
    >
      <Card title={t("users.fields.roles", "Roles")} bordered={false}>
        <Form
          {...formProps}
          layout="vertical"
          initialValues={formInitialValues} // Set initial values here
        >
          {/* Display user ID or email for context if needed, but not editable */}
          {/* <Form.Item label={t("users.fields.email", "Email")}> */}
          {/*   <Input value={userData?.email} readOnly disabled /> */}
          {/* </Form.Item> */}

          <Form.Item
            label={t("users.fields.roles", "Roles")}
            name="roleIds" // This name MUST match the expected field in the PUT request body
            rules={[
              {
                required: false, // Roles might not be mandatory to assign
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder={t("users.placeholders.selectRoles", "Assign roles")} // Add placeholder translation
              {...roleSelectProps} // Pass props from useSelect (options, loading, etc.)
              loading={rolesQueryResult.isLoading}
              disabled={!canEdit} // Disable if user can't edit
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Card>
    </Edit>
  );
};
