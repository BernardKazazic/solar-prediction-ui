import { CanAccess, useTranslate } from "@refinedev/core";
import {
  useTable,
  EditButton,
  DeleteButton,
  ShowButton,
} from "@refinedev/antd";
import { Table, Typography, Flex, Progress } from "antd";
import type { IPlant } from "../../../interfaces";
import { PaginationTotal, PlantStatus } from "../..";
import { EyeOutlined } from "@ant-design/icons";

export const PlantListTable = () => {
  const t = useTranslate();

  const { tableProps } = useTable<IPlant>();

  return (
    <Table
      {...tableProps}
      rowKey="plant_id"
      scroll={{
        x: true,
      }}
      pagination={{
        ...tableProps.pagination,
        showTotal: (total) => (
          <PaginationTotal total={total} entityName="power_plants" />
        ),
      }}
    >
      <Table.Column
        dataIndex="plant_id"
        width={80}
        title={
          <Typography.Text style={{ whiteSpace: "nowrap" }}>ID</Typography.Text>
        }
        render={(value) => (
          <Typography.Text style={{ whiteSpace: "nowrap" }}>
            {value}
          </Typography.Text>
        )}
      />
      <Table.Column dataIndex="plant_name" title={t("plants.fields.name")} />
      <Table.Column
        dataIndex="capacity_mw"
        title={t("plants.fields.capacity")}
        render={(value) => <Typography.Text>{value} MW</Typography.Text>}
      />
      <Table.Column
        dataIndex="current_production"
        width={"15%"}
        title={t("plants.fields.currentProduction", "Current production")}
        render={(value) => <Typography.Text>{value} MW</Typography.Text>}
      />
      <Table.Column
        dataIndex="utilization"
        title={t("plants.fields.utilization", "Utilization")}
        render={(value) => <Progress percent={value}></Progress>}
      />
      <Table.Column dataIndex="models" title={t("plants.fields.models")} />
      <Table.Column
        dataIndex="status"
        title={t("plants.fields.isActive.label")}
        render={(value) => <PlantStatus value={value} />}
      />
      <Table.Column
        fixed="right"
        title={t("table.actions")}
        dataIndex="actions"
        key="actions"
        align="center"
        render={(_, record) => (
          <Flex justify="center" align="center" gap={10}>
            <ShowButton
              icon={<EyeOutlined />}
              recordItemId={record.plant_id}
              hideText
            />
            <CanAccess resource="power_plants" action="delete">
              <EditButton recordItemId={record.plant_id} hideText />
              <DeleteButton recordItemId={record.plant_id} hideText />
            </CanAccess>
          </Flex>
        )}
      />
    </Table>
  );
};
