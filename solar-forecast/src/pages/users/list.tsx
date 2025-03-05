import {
  useTranslate,
  type HttpError,
  useGo,
  useNavigation,
} from "@refinedev/core";
import {
  List,
  useTable,
  DateField,
  DeleteButton,
  CreateButton,
} from "@refinedev/antd";
import { Table, Avatar, Typography, theme, Button } from "antd";

import type { IUser } from "../../interfaces";
import { EditOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";
import { PaginationTotal, UserStatus } from "../../components";
import type { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";

export const UserList = ({ children }: PropsWithChildren) => {
  const go = useGo();
  const { pathname } = useLocation();
  const { showUrl, editUrl } = useNavigation();
  const t = useTranslate();
  const { token } = theme.useToken();

  const { tableProps } = useTable<IUser, HttpError>();

  return (
    <List
      breadcrumb={false}
      headerButtons={(props) => [
        <CreateButton {...props.createButtonProps} key="create" size="middle">
          {t("users.actions.add", "New user")}
        </CreateButton>,
      ]}
    >
      <Table
        {...tableProps}
        rowKey="id"
        scroll={{ x: true }}
        pagination={{
          ...tableProps.pagination,
          showTotal: (total) => (
            <PaginationTotal total={total} entityName="users" />
          ),
        }}
      >
        <Table.Column
          key="id"
          dataIndex="id"
          title="ID"
          render={(value) => (
            <Typography.Text
              style={{
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </Typography.Text>
          )}
        />
        <Table.Column
          align="center"
          key="avatar_url"
          dataIndex={["avatar_url"]}
          title={t("users.fields.avatar.label")}
          render={(value) => <Avatar src={value} icon={<UserOutlined />} />}
        />
        <Table.Column
          key="full_name"
          dataIndex="full_name"
          title={t("users.fields.name")}
        />
        <Table.Column
          key="email"
          dataIndex="email"
          title={t("users.fields.email")}
        />
        <Table.Column
          key="role"
          dataIndex="role"
          title={t("users.fields.role")}
          render={(value) => t(`users.roles.${value}`, value)}
        />
        <Table.Column
          key="created_at"
          dataIndex="created_at"
          title={t("users.fields.createdAt")}
          render={(value) => (
            <DateField value={value} format="DD.MM.YYYY. HH:mm" />
          )}
          sorter
        />
        <Table.Column<IUser>
          fixed="right"
          title={t("table.actions")}
          render={(_, record) => (
            <>
              <Button
                icon={<EyeOutlined />}
                onClick={() => {
                  return go({
                    to: `${showUrl("users", record.id)}`,
                    query: {
                      to: pathname,
                    },
                    options: {
                      keepQuery: true,
                    },
                    type: "replace",
                  });
                }}
              />
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  return go({
                    to: `${editUrl("users", record.id)}`,
                    query: {
                      to: pathname,
                    },
                    options: {
                      keepQuery: true,
                    },
                    type: "replace",
                  });
                }}
                style={{ marginLeft: "7px" }}
              />

              <DeleteButton
                hideText
                recordItemId={record.id}
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        />
      </Table>
      {children}
    </List>
  );
};
