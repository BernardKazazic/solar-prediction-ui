import React from "react";
import { Show, TextField, TagField } from "@refinedev/antd";
import { useShow } from "@refinedev/core"; // Corrected import
import { Typography, List as AntList } from "antd"; // Removed unused Tag import
import { IRoleResponse } from "../../interfaces/index.d"; // Adjust path if necessary

const { Title } = Typography;

export const RoleShow: React.FC = () => {
  const { queryResult } = useShow<IRoleResponse>({
    resource: "roles",
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  // Ensure permissions is an array before passing to AntList
  const permissionsList = Array.isArray(record?.permissions)
    ? record.permissions
    : [];

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>ID</Title>
      <TextField value={record?.id ?? "-"} />

      <Title level={5}>Name</Title>
      <TextField value={record?.name ?? "-"} />

      <Title level={5}>Description</Title>
      <TextField value={record?.description ?? "-"} />

      <Title level={5}>Permissions</Title>
      {permissionsList.length > 0 ? (
        <AntList
          size="small"
          bordered
          dataSource={permissionsList} // Use the validated array
          renderItem={(item: string) => <AntList.Item>{item}</AntList.Item>} // Added type for item
          style={{ maxWidth: "400px" }} // Optional styling
        />
      ) : (
        <TextField value="No permissions assigned" />
      )}
    </Show>
  );
};
