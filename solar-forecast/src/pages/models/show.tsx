import { useShow, useTranslate, useApiUrl, useCustom } from "@refinedev/core";
import type { Model } from "../../interfaces";
import { Breadcrumb, EditButton, List, ListButton } from "@refinedev/antd";
import { Button, Col, Flex, Row, Skeleton, Typography, message } from "antd";
import { LeftOutlined, SettingOutlined } from "@ant-design/icons";
import {
  CardWithContent,
  ModelDetails,
} from "../../components";
import { ModelHorizonChart, ModelCycleChart, type ModelHorizonChartRef, type ModelCycleChartRef } from "../../components/model";
import { useRef } from "react";

export const ModelShow = () => {
  const t = useTranslate();
  const { query: queryResult } = useShow<Model>();
  const { data, isLoading } = queryResult;
  const record = data?.data;
  const API_URL = useApiUrl();
  const horizonChartRef = useRef<ModelHorizonChartRef>(null);
  const cycleChartRef = useRef<ModelCycleChartRef>(null);

  const {
    refetch: recalculateMetrics,
    isFetching: isRecalculatingMetrics,
  } = useCustom({
    url: `${API_URL}/metric/calculate/${record?.id}`,
    method: "post",
    queryOptions: {
      enabled: false,
    },
    successNotification: {
      message: t("common.metricsRecalculationCompleted"),
      type: "success",
    },
    errorNotification: {
      message: t("common.metricsRecalculationFailed"),
      type: "error",
    },
  });

  const handleCustomDatasetRun = () => {
    console.log("Run with custom dataset clicked");
  };

  const handleRecalculateMetrics = async () => {
    if (record?.id) {
      try {
        await recalculateMetrics();
        // Directly trigger refetch on both chart components
        horizonChartRef.current?.refetch();
        cycleChartRef.current?.refetch();
      } catch (error) {
        // Error handling is done by the successNotification/errorNotification
      }
    }
  };

  return (
    <>
      <Flex style={{ marginBottom: "10px" }}>
        <ListButton icon={<LeftOutlined />}>{t("models.models")}</ListButton>
      </Flex>
      <List
        breadcrumb={<Breadcrumb hideIcons showHome={true} />}
        title={
          isLoading ? (
            <Skeleton.Input
              active
              style={{
                width: "144px",
                minWidth: "144pxpx",
                height: "28px",
              }}
            />
          ) : (
            record?.name
          )
        }
        headerButtons={[
          <Button
            type="primary"
            size="large"
            key="custom-run"
            onClick={handleCustomDatasetRun}
          >
            {t("common.runWithCustomDataset")}
          </Button>,
          <Button
            type="default"
            size="large"
            key="recalculate-metrics"
            onClick={handleRecalculateMetrics}
            loading={isRecalculatingMetrics}
            disabled={!record?.id}
          >
            {t("common.recalculateMetrics")}
          </Button>,
          <EditButton
            hideText={true}
            icon={<SettingOutlined />}
            size="large"
          />,
        ]}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Flex gap={16} vertical>
              <CardWithContent
                bodyStyles={{
                  padding: 0,
                }}
                title={t("models.titles.modelDetails")}
              >
                <ModelDetails model={record} isLoading={isLoading} />
              </CardWithContent>
              <div 
                style={{ 
                  backgroundColor: "#f6f8fa",
                  border: "1px solid #d1d9e0",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  marginBottom: "16px"
                }}
              >
                <Typography.Text 
                  style={{ 
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#656d76"
                  }}
                >
                  ℹ️ {t("models.errorCalculationNote")}
                </Typography.Text>
              </div>
              <ModelHorizonChart ref={horizonChartRef} />
              <ModelCycleChart ref={cycleChartRef} />
            </Flex>
          </Col>
        </Row>
      </List>
    </>
  );
};
