import { CanAccess, useTranslate } from "@refinedev/core";
import {
  useTable,
  EditButton,
  DeleteButton,
  ShowButton,
} from "@refinedev/antd";
import { Table, Typography, Flex } from "antd";
import type { Plant } from "../../../interfaces";
import { PaginationTotal } from "../..";
import { EyeOutlined } from "@ant-design/icons";

export const PlantListTable = () => {
  const t = useTranslate();

  const { tableProps } = useTable<Plant>();

  return (
    <Table
      {...tableProps}
      rowKey="id"
      scroll={{
        x: true,
      }}
      pagination={{
        ...tableProps.pagination,
        showTotal: (total) => (
          <PaginationTotal total={total} entityName="power_plant" />
        ),
      }}
    >
      <Table.Column
        dataIndex="id"
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
      <Table.Column dataIndex="name" title={t("plants.fields.name")} />
      <Table.Column
        dataIndex="capacity"
        title={t("plants.fields.capacity")}
        render={(value) => <Typography.Text>{value} W</Typography.Text>}
      />
      <Table.Column
        dataIndex="model_count"
        title={t("plants.fields.modelCount", "Model Count")}
        render={(value) => <Typography.Text>{value}</Typography.Text>}
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
              recordItemId={record.id}
              hideText
            />
            <CanAccess resource="power_plant" action="delete">
              <EditButton recordItemId={record.id} hideText />
              <DeleteButton recordItemId={record.id} hideText />
            </CanAccess>
          </Flex>
        )}
      />
    </Table>
  );
};
