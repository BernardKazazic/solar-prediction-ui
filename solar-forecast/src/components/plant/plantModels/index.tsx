import { Flex, Table, Typography, Tag } from "antd";
import { ShowButton } from "@refinedev/antd";
import { useCustom, useApiUrl, useTranslate } from "@refinedev/core";
import { EyeOutlined } from "@ant-design/icons";
import { Model, Plant } from "../../../interfaces";

export const PlantModels = ({ plant }: { plant: Plant | undefined }) => {
  const t = useTranslate();
  const API_URL = useApiUrl();

  const { data, isLoading } = useCustom<Model[]>({
    url: `${API_URL}/power_plant/${plant?.id}/models`,
    method: "get",
    queryOptions: {
      enabled: !!plant?.id,
    },
  });

  return (
    <Table
      dataSource={data?.data}
      rowKey="id"
      loading={isLoading}
      pagination={false}
      scroll={{ x: true }}
    >
      <Table.Column<Model>
        title={t("models.fields.name.label")}
        dataIndex="name"
        key="name"
        render={(text) => (
          <Typography.Text style={{ whiteSpace: "nowrap" }}>
            {text}
          </Typography.Text>
        )}
      />
      <Table.Column<Model>
        title={t("models.fields.version.label", "Version")}
        dataIndex="version"
        key="version"
        align="center"
        render={(value) => (
          <Typography.Text>v{value}</Typography.Text>
        )}
      />
      <Table.Column<Model>
        title={t("models.fields.isActive.label", "Status")}
        dataIndex="is_active"
        key="is_active"
        align="center"
        width={100}
        render={(value: boolean) => (
          <Tag color={value ? "green" : "red"}>
            {value ? t("common.active", "Active") : t("common.inactive", "Inactive")}
          </Tag>
        )}
      />
      <Table.Column<Model>
        title={t("models.actions.label")}
        key="actions"
        align="center"
        render={(record) => (
          <Flex gap={10} justify="center">
            <ShowButton
              icon={<EyeOutlined />}
              hideText
              resource="models"
              recordItemId={record.id}
            />
          </Flex>
        )}
      />
    </Table>
  );
};
