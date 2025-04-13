import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import { IRoleResponse } from "../../interfaces/index.d"; // Adjust path if necessary

export const RoleCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<IRoleResponse>({
    resource: "roles",
    action: "create",
    redirect: "list", // Redirect to the list page after successful creation
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
        {/* Permissions are assigned during edit, not creation, based on API spec */}
      </Form>
    </Create>
  );
};
