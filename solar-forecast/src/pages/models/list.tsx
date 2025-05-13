import { useTranslate, useNavigation } from "@refinedev/core";
import {
  CreateButton,
  ShowButton,
  List,
  useTable,
  EditButton,
  DeleteButton,
} from "@refinedev/antd";
import { EyeOutlined, SearchOutlined, TrophyFilled } from "@ant-design/icons";
import { Table, Typography, theme } from "antd";
import type { Model } from "../../interfaces";
import { PaginationTotal, ModelStatus, ModelRating } from "../../components";
import type { PropsWithChildren } from "react";
import { useMany } from "@refinedev/core";

export const ModelList = ({ children }: PropsWithChildren) => {
  const t = useTranslate();
  const { token } = theme.useToken();

  const { tableProps } = useTable<Model>();

  const { data: plantData, isLoading: plantIsLoading } = useMany({
    resource: "power_plants",
    ids:
      tableProps?.dataSource?.map((item) => item?.plant_id).filter(Boolean) ??
      [],
    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

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
            dataIndex="model_id"
            key="model_id"
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
            key="model_name"
            dataIndex="model_name"
            title={t("models.fields.name.label")}
            filterIcon={(filtered) => (
              <SearchOutlined
                style={{
                  color: filtered ? token.colorPrimary : undefined,
                }}
              />
            )}
            render={(_, record) => {
              return (
                <>
                  <Typography.Text>{record?.model_name} </Typography.Text>
                  {record?.best && (
                    <Typography.Text
                      style={{ color: "gold", fontWeight: "bold" }}
                    >
                      <TrophyFilled />
                    </Typography.Text>
                  )}
                </>
              );
            }}
          />
          <Table.Column
            dataIndex="plant_id"
            title={t("models.fields.plant.label")}
            render={(value) =>
              plantIsLoading ? (
                ""
              ) : (
                <Typography.Text
                  style={{
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    show("power_plants", value);
                  }}
                >
                  {
                    plantData?.data?.find((item) => item.plant_id === value)
                      ?.plant_name
                  }
                </Typography.Text>
              )
            }
          />
          <Table.Column<Model>
            dataIndex={["model_type"]}
            key="type"
            title={t("models.fields.type.label")}
          />
          <Table.Column<Model>
            dataIndex="id"
            key="ratings"
            title={t("models.fields.accuracy.label")}
            render={(_, record) => {
              return <ModelRating model={record} />;
            }}
          />
          <Table.Column<Model>
            dataIndex="status"
            key="status"
            title={t("models.fields.status.label")}
            render={(_, record) => {
              return <ModelStatus value={record.status} isLoading={false} />;
            }}
          />
          <Table.Column
            title={t("table.actions")}
            key="actions"
            fixed="right"
            align="center"
            render={(_, record: Model) => {
              return (
                <>
                  <ShowButton
                    icon={<EyeOutlined />}
                    hideText
                    recordItemId={record.model_id}
                  />
                  <EditButton
                    hideText
                    recordItemId={record.model_id}
                    style={{ marginLeft: 8 }}
                  />
                  <DeleteButton
                    hideText
                    recordItemId={record.model_id}
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
