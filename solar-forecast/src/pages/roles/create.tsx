import React, { useCallback, useMemo } from "react";
import { HttpError } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, notification } from "antd";
import { useTranslation } from "react-i18next";

import { RoleResponse } from "../../interfaces/index.d";

// Constants
const DESCRIPTION_ROWS = 4;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;
const DESCRIPTION_MIN_LENGTH = 5;
const DESCRIPTION_MAX_LENGTH = 255;

interface CreateRoleRequest {
  name: string;
  description: string;
}

export const RoleCreate: React.FC = () => {
  const { t } = useTranslation();
  
  const { formProps, saveButtonProps, formLoading } = useForm<
    RoleResponse,
    HttpError,
    CreateRoleRequest
  >({
    resource: "roles",
    action: "create",
    redirect: "list",
    successNotification: () => ({
      message: t("notifications.success"),
      description: t("notifications.createSuccess", {
        resource: t("roles.title", "Role"),
      }),
      type: "success",
    }),
    errorNotification: false, // Handle errors manually
    onMutationError: (error) => {
      console.error("Role creation failed:", error);
      notification.error({
        message: t("notifications.error"),
        description: t("notifications.createError", {
          resource: t("roles.title", "Role"),
        }),
      });
    },
  });

  // Memoized field labels
  const fieldLabels = useMemo(() => ({
    name: t("roles.fields.name", "Name"),
    description: t("roles.fields.description", "Description"),
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

  // Form handlers
  const handleFormFinishFailed = useCallback((errorInfo: any) => {
    console.error("Form validation failed:", errorInfo);
    notification.error({
      message: t("notifications.error"),
      description: t("notifications.formError"),
    });
  }, [t]);

  const handleFormValuesChange = useCallback((changedValues: any, allValues: any) => {
    // Optional: Add any real-time validation or formatting logic here
    console.log("Form values changed:", changedValues);
  }, []);

  return (
    <Create 
      saveButtonProps={{
        ...saveButtonProps,
        loading: formLoading,
      }}
      title={t("roles.titles.create", "Create Role")}
    >
      <Form 
        {...formProps} 
        layout="vertical"
        onFinishFailed={handleFormFinishFailed}
        onValuesChange={handleFormValuesChange}
        autoComplete="off"
      >
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
      </Form>
    </Create>
  );
};
