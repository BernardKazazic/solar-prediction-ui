import React, { useImperativeHandle, forwardRef } from "react";
import { useTranslate, useList, HttpError } from "@refinedev/core";
import { useModalForm } from "@refinedev/antd";
import { Modal, Form, Input, Select, notification } from "antd";

import {
  CreateUserRequest,
  CreateUserTicketResponse,
  RoleResponse,
} from "../../interfaces";

// Constants
const CONNECTION_OPTIONS = [
  {
    label: "Username-Password-Authentication",
    value: "Username-Password-Authentication",
  },
  // Add other connection types here in the future if needed
];

const ROLES_PAGE_SIZE = 100;
const REFETCH_DELAY = 2000;

interface CreateUserModalProps {
  onUserCreated: (ticketUrl: string) => void;
  onRefetchTable: () => void;
}

export interface CreateUserModalRef {
  show: () => void;
}

export const CreateUserModal = forwardRef<CreateUserModalRef, CreateUserModalProps>(
  ({ onUserCreated, onRefetchTable }, ref) => {
    const t = useTranslate();

    // Fetch roles for dropdown
    const { data: rolesData, isLoading: rolesLoading } = useList<RoleResponse>({
      resource: "roles",
      pagination: {
        pageSize: ROLES_PAGE_SIZE,
      },
    });

    const dynamicRoleOptions =
      rolesData?.data?.map((role) => ({
        label: role.name,
        value: role.id,
      })) || [];

    // Modal form hook for creating users
    const { modalProps, formProps, show, formLoading } = useModalForm<
      CreateUserRequest,
      HttpError,
      CreateUserTicketResponse
    >({
      action: "create",
      resource: "users",
      redirect: false,
      successNotification: () => ({
        message: t("notifications.success"),
        description: t("notifications.createSuccess", {
          resource: t("users.title", "User"),
        }),
        type: "success",
      }),
      onMutationSuccess: (data, variables, context) => {
        try {
          if (
            data?.data &&
            typeof data.data === "object" &&
            "ticketUrl" in data.data &&
            typeof (data.data as CreateUserTicketResponse).ticketUrl === "string"
          ) {
            const url = (data.data as CreateUserTicketResponse).ticketUrl;
            onUserCreated(url);
            
            // Refetch table data after successful creation
            setTimeout(() => {
              onRefetchTable();
            }, REFETCH_DELAY);
          } else {
            throw new Error("Invalid response structure - ticketUrl not found");
          }
        } catch (error) {
          console.error(
            "Error processing user creation response:",
            error,
            "Response data:",
            data
          );
          
          notification.error({
            message: t("users.ticketUrl.fetchErrorTitle"),
            description: t("users.ticketUrl.fetchErrorDesc"),
          });
        }
      },
      onMutationError: (error) => {
        console.error("User creation failed:", error);
        
        notification.error({
          message: t("notifications.error"),
          description: t("notifications.createError", {
            resource: t("users.title", "User"),
          }),
        });
      },
    });

    // Expose the show function via ref
    useImperativeHandle(ref, () => ({
      show,
    }), [show]);

    return (
      <Modal
        {...modalProps}
        title={t("users.actions.invite", "Invite New User")}
        confirmLoading={formLoading}
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
            <Input placeholder={t("users.placeholders.email", "Enter email address")} />
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
              options={CONNECTION_OPTIONS}
              placeholder={t("users.placeholders.connection", "Select connection type")}
            />
          </Form.Item>
          
          <Form.Item 
            label={t("users.fields.roles", "Roles")} 
            name="roleIds"
          >
            <Select
              mode="multiple"
              placeholder={t("users.placeholders.selectRoles", "Assign roles")}
              options={dynamicRoleOptions}
              loading={rolesLoading}
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
); 