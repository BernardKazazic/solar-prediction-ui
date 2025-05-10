import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Spin } from "antd";
import { useList, HttpError } from "@refinedev/core";
import {
  IRoleResponse,
  IPermissionResponse,
  UpdateRoleRequest,
} from "../../interfaces/index.d"; // Adjust path if necessary
import { useTranslation } from "react-i18next";

export const RoleEdit: React.FC = () => {
  const { t } = useTranslation();
  const { formProps, saveButtonProps } = useForm<
    IRoleResponse,
    HttpError,
    UpdateRoleRequest
  >({
    resource: "roles",
    action: "edit",
    redirect: "list", // Redirect to list after successful edit
    successNotification: () => ({
      message: t("notifications.success"),
      description: t("notifications.editRoleSuccessSingular"),
      type: "success",
    }),
    // We need to transform the outgoing data to match the API: PUT /roles/{roleId}
    // It expects { name, description, permissionIds: [...] }
    // The form uses the field "permissions" which matches the IRoleResponse field.
    // Refine's useForm should pass this through, but if the API needs 'permissionIds', we'd add a mutation override here.
    // For now, assuming the backend adapter or API handles mapping 'permissions' field to 'permissionIds' if needed, or the field name is consistent.
  });

  // Fetch all available permissions
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useList<IPermissionResponse>({
    resource: "permissions",
    pagination: {
      mode: "off", // Fetch all permissions, no pagination needed
    },
    // Note: This assumes the data provider correctly handles the response structure
    // where permissions are in `data.data.content` or just `data.data`.
    // If `permissionsData.data` isn't the array, adjustment might be needed.
  });

  // Handle potential nested structure from API response
  const allPermissions = permissionsData?.data;

  const permissionOptions = Array.isArray(allPermissions)
    ? allPermissions.map((p) => ({
        label: `${p.permissionName} (${p.description})`,
        value: p.permissionName,
      }))
    : [];

  // Note: The `useForm` hook fetches the record data (`GET /roles/{id}`)
  // The `queryResult.data.data` holds the role being edited.
  // The `formProps` automatically populates the form fields based on this data.
  // The `name="permissions"` in Form.Item ensures the Select is populated with the role's current permissions.

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="ID"
          name="id"
          // Disable ID editing
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input the role name!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              required: true,
              message: "Please input the role description!",
            },
          ]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="Permissions"
          name="permissions" // Matches IRoleResponse field name and expected PUT payload key
          help={permissionsError ? "Error loading permissions" : undefined}
          validateStatus={permissionsError ? "error" : undefined}
        >
          {permissionsLoading ? (
            <Spin />
          ) : (
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Select permissions"
              options={permissionOptions}
            />
          )}
        </Form.Item>
      </Form>
    </Edit>
  );
};
