import { Button, Flex, Table, Typography, message } from "antd";
import { NumberField, ShowButton } from "@refinedev/antd";
import { useList, useCustom, useApiUrl, useTranslate } from "@refinedev/core"; // Refine hooks for data fetching and API calls
import { ModelStatus } from "../../model";
import { EyeOutlined, TrophyFilled } from "@ant-design/icons";
import { SetStateAction, useState } from "react";
import { LegacyModel, Plant } from "../../../interfaces";

export const PlantModels = ({ plant }: { plant: Plant | undefined }) => {
  const { data, isLoading } = useList<LegacyModel>({
    resource: "models",
    filters: [{ field: "plant_id", operator: "eq", value: plant?.id }],
    queryOptions: {
      enabled: !!plant,
    },
  });
  const [runId, setRunId] = useState(null);
  const t = useTranslate();
  const API_URL = useApiUrl();
  const {
    refetch,
    data: runData,
    isLoading: isRunLoading,
    isFetching: isRunFetching,
  } = useCustom({
    url: `${API_URL}/models/run`,
    method: "post",
    config: {
      payload: {
        id: runId,
      },
    },
    queryOptions: {
      enabled: false,
    },
  });

  const handleRun = (id: SetStateAction<null>) => {
    setRunId(id);
    refetch();
    message.success(t("Model has started running"));
  };

  const sortedModels = data?.data?.sort((a, b) => b.accuracy - a.accuracy);

  return (
    <Table
      dataSource={sortedModels}
      rowKey="id"
      loading={isLoading}
      pagination={false}
      scroll={{ x: true }}
    >
      <Table.Column<LegacyModel>
        title={t("models.fields.name.label")}
        dataIndex="model_name"
        key="model_name"
        render={(text, record) => (
          <Flex gap={16} align="center" style={{ whiteSpace: "nowrap" }}>
            <Typography.Text>{text}</Typography.Text>
            {record.best && (
              <Typography.Text style={{ color: "gold", fontWeight: "bold" }}>
                <TrophyFilled /> Best
              </Typography.Text>
            )}
          </Flex>
        )}
      />
      <Table.Column<LegacyModel>
        title={t("models.fields.accuracy.label")}
        dataIndex="accuracy"
        key="accuracy"
        align="center"
        render={(value) => (
          <NumberField
            value={value / 100}
            options={{ style: "percent", minimumFractionDigits: 2 }}
          />
        )}
      />
      <Table.Column<LegacyModel>
        title={t("models.fields.status.label")}
        dataIndex="status"
        key="status"
        align="center"
        render={(status) => (
          <ModelStatus value={status} isLoading={isLoading} />
        )}
      />
      <Table.Column<LegacyModel>
        title={t("models.actions.label")}
        key="actions"
        align="center"
        render={(record) => (
          <Flex gap={10} justify="center">
            <Button
              type="primary"
              onClick={() => handleRun(record.model_id)}
              loading={runId == record.model_id && isRunFetching}
              disabled={record.status == "running"}
            >
              {t("Run")}
            </Button>
            <ShowButton
              icon={<EyeOutlined />}
              hideText
              resource="models"
              recordItemId={record.model_id}
            />
          </Flex>
        )}
      />
    </Table>
  );
};
