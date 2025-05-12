import React from "react";
import { Show, TextField, TagField } from "@refinedev/antd";
import { useShow } from "@refinedev/core"; // Corrected import
import { Typography, List as AntList } from "antd"; // Removed unused Tag import
import { RoleResponse } from "../../interfaces/index.d"; // Adjust path if necessary
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export const RoleShow: React.FC = () => {
  const { t } = useTranslation();
  const { queryResult } = useShow<RoleResponse>({
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
      <Title level={5}>{t("roles.fields.id", "ID")}</Title>
      <TextField value={record?.id ?? "-"} />

      <Title level={5}>{t("roles.fields.name", "Name")}</Title>
      <TextField value={record?.name ?? "-"} />

      <Title level={5}>{t("roles.fields.description", "Description")}</Title>
      <TextField value={record?.description ?? "-"} />

      <Title level={5}>{t("roles.fields.permissions", "Permissions")}</Title>
      {permissionsList.length > 0 ? (
        <AntList
          size="small"
          bordered
          dataSource={permissionsList} // Use the validated array
          renderItem={(item: string) => <AntList.Item>{item}</AntList.Item>} // Added type for item
          style={{ maxWidth: "400px" }} // Optional styling
        />
      ) : (
        <TextField
          value={t("roles.noPermissions", "No permissions assigned")}
        />
      )}
    </Show>
  );
};
