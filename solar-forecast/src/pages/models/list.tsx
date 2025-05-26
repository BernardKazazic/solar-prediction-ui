import { useTranslate, useNavigation } from "@refinedev/core";
import {
  CreateButton,
  ShowButton,
  List,
  useTable,
  EditButton,
  DeleteButton,
} from "@refinedev/antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Table, Typography, theme, Tag } from "antd";
import type { Model } from "../../interfaces";
import { PaginationTotal } from "../../components";
import type { PropsWithChildren } from "react";

export const ModelList = ({ children }: PropsWithChildren) => {
  const t = useTranslate();
  const { token } = theme.useToken();

  const { tableProps } = useTable<Model>();

  const { show } = useNavigation();

  return (
    <>
      <List
        breadcrumb={false}
        headerButtons={(props) => [
          <CreateButton {...props.createButtonProps} key="create" size="middle">
            {t("models.actions.add")}
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
              <PaginationTotal total={total} entityName="models" />
            ),
          }}
        >
          <Table.Column
            title={
              <Typography.Text
                style={{
                  whiteSpace: "nowrap",
                }}
              >
                ID
              </Typography.Text>
            }
            dataIndex="id"
            key="id"
            width={80}
            render={(value) => (
              <Typography.Text
                style={{
                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </Typography.Text>
            )}
            filterIcon={(filtered) => (
              <SearchOutlined
                style={{
                  color: filtered ? token.colorPrimary : undefined,
                }}
              />
            )}
          />
          <Table.Column<Model>
            key="name"
            dataIndex="name"
            title={t("models.fields.name.label")}
            filterIcon={(filtered) => (
              <SearchOutlined
                style={{
                  color: filtered ? token.colorPrimary : undefined,
                }}
              />
            )}
            render={(value) => {
              return <Typography.Text>{value}</Typography.Text>;
            }}
          />
          <Table.Column<Model>
            dataIndex="version"
            key="version"
            title={t("models.fields.version.label")}
            width={100}
            render={(value) => (
              <Typography.Text>v{value}</Typography.Text>
            )}
          />
          <Table.Column
            dataIndex="plant_name"
            title={t("models.fields.plant.label")}
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
          <Table.Column<Model>
            dataIndex="type"
            key="type"
            title={t("models.fields.type.label")}
            render={(value) => (
              <Typography.Text style={{ textTransform: "capitalize" }}>
                {value}
              </Typography.Text>
            )}
          />
          <Table.Column<Model>
            dataIndex="file_type"
            key="file_type"
            title={t("models.fields.fileType.label", "File Type")}
            width={120}
            render={(value: string) => (
              <Tag color="blue">
                {value}
              </Tag>
            )}
          />
          <Table.Column<Model>
            dataIndex="is_active"
            key="is_active"
            title={t("models.fields.isActive.label", "Status")}
            width={100}
            render={(value: boolean) => (
              <Tag color={value ? "green" : "red"}>
                {value ? t("common.active", "Active") : t("common.inactive", "Inactive")}
              </Tag>
            )}
          />
          <Table.Column<Model>
            dataIndex="features"
            key="features"
            title={t("models.fields.features.label")}
            render={(features: string[]) => (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {features?.map((feature, index) => (
                  <Tag key={index}>
                    {feature}
                  </Tag>
                ))}
              </div>
            )}
          />
          <Table.Column
            title={t("common.table.actions")}
            key="actions"
            fixed="right"
            align="center"
            render={(_, record: Model) => {
              return (
                <>
                  <ShowButton
                    icon={<EyeOutlined />}
                    hideText
                    recordItemId={record.id}
                  />
                  <EditButton
                    hideText
                    recordItemId={record.id}
                    style={{ marginLeft: 8 }}
                  />
                  <DeleteButton
                    hideText
                    recordItemId={record.id}
                    style={{ marginLeft: 8 }}
                  />
                </>
              );
            }}
          />
        </Table>
      </List>
      {children}
    </>
  );
};
