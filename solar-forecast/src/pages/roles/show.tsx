import React, { useMemo, useCallback } from "react";
import { useShow, HttpError } from "@refinedev/core";
import { Show, TextField } from "@refinedev/antd";
import { Typography, List as AntList, Result, Alert, Spin } from "antd";
import { useTranslation } from "react-i18next";

import { RoleResponse } from "../../interfaces/index.d";

const { Title } = Typography;

// Constants
const MAX_LIST_WIDTH = 400;
const FIELD_SPACING = 24;

export const RoleShow: React.FC = () => {
  const { t } = useTranslation();
  
  const { queryResult } = useShow<RoleResponse, HttpError>({
    resource: "roles",
  });
  
  const { data, isLoading, isError, error } = queryResult;
  const record = data?.data;

  // Memoized field labels
  const fieldLabels = useMemo(() => ({
    id: t("roles.fields.id", "ID"),
    name: t("roles.fields.name", "Name"),
    description: t("roles.fields.description", "Description"),
    permissions: t("roles.fields.permissions", "Permissions"),
  }), [t]);

  // Memoized permissions list with validation
  const permissionsList = useMemo(() => {
    if (!record?.permissions) return [];
    return Array.isArray(record.permissions) ? record.permissions : [];
  }, [record?.permissions]);

  // Error handler
  const handleError = useCallback(() => {
    console.error("Failed to load role data:", error);
  }, [error]);

  // Render functions
  const renderFieldValue = useCallback((value: string | undefined, fallback = "-") => (
    <TextField value={value ?? fallback} />
  ), []);

  const renderPermissionsList = useCallback(() => {
    if (permissionsList.length === 0) {
      return (
        <Alert
          message={t("roles.noPermissions", "No permissions assigned")}
          type="info"
          showIcon
          style={{ maxWidth: MAX_LIST_WIDTH }}
        />
      );
    }

    return (
      <AntList
        size="small"
        bordered
        dataSource={permissionsList}
        renderItem={(permission: string) => (
          <AntList.Item>
            <Typography.Text code>{permission}</Typography.Text>
          </AntList.Item>
        )}
        style={{ maxWidth: MAX_LIST_WIDTH }}
      />
    );
  }, [permissionsList, t]);

  const renderField = useCallback((label: string, value: string | undefined, isLast = false) => (
    <div style={{ marginBottom: isLast ? 0 : FIELD_SPACING }}>
      <Title level={5} style={{ marginBottom: 8 }}>
        {label}
      </Title>
      {renderFieldValue(value)}
    </div>
  ), [renderFieldValue]);

  // Loading state
  if (isLoading) {
    return (
      <Show isLoading={true}>
        <Spin tip={t("common.loading", "Loading...")} />
      </Show>
    );
  }

  // Error state
  if (isError) {
    handleError();
    return (
      <Show>
        <Result
          status="error"
          title={t("errors.loadingError.title", "Loading Error")}
          subTitle={t("errors.loadingError.subTitle", "Failed to load role data.")}
          extra={
            <Typography.Text type="secondary">
              {error?.message || t("notifications.fetchError")}
            </Typography.Text>
          }
        />
      </Show>
    );
  }

  // No data state
  if (!record) {
    return (
      <Show>
        <Result
          status="404"
          title={t("errors.notFound.title", "Role Not Found")}
          subTitle={t("errors.notFound.subTitle", "The requested role could not be found.")}
        />
      </Show>
    );
  }

  return (
    <Show isLoading={isLoading} title={t("roles.titles.show", "Show Role")}>
      {renderField(fieldLabels.id, record.id)}
      {renderField(fieldLabels.name, record.name)}
      {renderField(fieldLabels.description, record.description)}
      
      <div>
        <Title level={5} style={{ marginBottom: 16 }}>
          {fieldLabels.permissions}
        </Title>
        {renderPermissionsList()}
      </div>
    </Show>
  );
};
