import { useEffect, useState } from "react";
import { useApiUrl, useCustom, useShow, useTranslate } from "@refinedev/core";
import type { IModel } from "../../interfaces";
import { Breadcrumb, EditButton, List, ListButton } from "@refinedev/antd";
import { Card, Col, Flex, message, Row, Skeleton, Statistic } from "antd";
import { LeftOutlined, SettingOutlined } from "@ant-design/icons";
import { ButtonRun } from "../../components/button";
import {
  CardWithContent,
  ModelDetails,
  ModelStatus,
  ModelTimeline,
} from "../../components";
import { ModelAccuracyChart, ModelMetrics } from "../../components/model";

export const ModelShow = () => {
  const t = useTranslate();
  const { query: queryResult } = useShow<IModel>();
  const { data, isLoading } = queryResult;
  const record = data?.data;
  const API_URL = useApiUrl();
  const [forecastFile, setForecastFile] = useState([]);
  const [formData, setFormData] = useState(new FormData());
  const {
    refetch,
    data: runData,
    isLoading: isRunLoading,
    isFetching: isRunFetching,
  } = useCustom({
    url: `${API_URL}/models/run`,
    method: "post",
    config: {
      payload: formData,
    },
    queryOptions: {
      enabled: false,
    },
  });

  const [localStatus, setLocalStatus] = useState(record?.status);

  useEffect(() => {
    setLocalStatus(record?.status);
  }, [record]);

  const handleRunClick = () => {
    const previousStatus = localStatus;
    const tempFormData = new FormData();
    tempFormData.append("id", record?.model_id?.toString() || "");
    tempFormData.append("file", forecastFile[0]);
    setFormData(tempFormData);
    setLocalStatus("running");
    refetch();
    message.success(t("Model has started running"));
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
            record?.model_name
          )
        }
        headerButtons={[
          <ButtonRun
            disabled={localStatus === "running"}
            key="run"
            onClick={handleRunClick}
            setFile={setForecastFile}
            forecastFile={forecastFile}
            onCustomRun={handleRunClick}
          >
            {t("buttons.run")}
          </ButtonRun>,
          <EditButton
            hideText={true}
            icon={<SettingOutlined />}
            size="large"
          />,
        ]}
      >
        <Row gutter={[16, 16]}>
          <Col xl={15} lg={24} md={24} sm={24} xs={24}>
            <Flex gap={16} vertical>
              <CardWithContent
                bodyStyles={{
                  height: "550px",
                  overflow: "hidden",
                  padding: "5px",
                }}
                title={t("models.history")}
              >
                <ModelAccuracyChart />
              </CardWithContent>
            </Flex>
            <Row gutter={16}>
              <Col span={24} style={{ marginTop: 16 }}>
                <ModelMetrics
                  data={record?.metrics}
                  isLoading={isLoading}
                  updated={record?.metrics_updated}
                />
              </Col>
            </Row>
          </Col>

          <Col xl={9} lg={24} md={24} sm={24} xs={24}>
            <Row gutter={[16, 32]} style={{ marginBottom: 8 }}>
              <Col style={{ width: "100%" }}>
                <Flex gap={16} align="center" style={{ width: "100%" }}>
                  <Card bordered={false} style={{ width: "50%" }}>
                    <Statistic
                      title={t("models.fields.accuracy.label")}
                      value={record?.accuracy}
                      precision={2}
                      suffix="%"
                      style={{ margin: "auto", width: "fit-content" }}
                      loading={isLoading}
                    />
                  </Card>

                  <Card bordered={false} style={{ flex: 1 }}>
                    <Statistic
                      title="Status"
                      valueRender={() => (
                        <ModelStatus
                          value={localStatus || ""}
                          isLoading={isLoading}
                        />
                      )}
                      style={{ margin: "auto", width: "fit-content" }}
                      loading={isLoading}
                    />
                  </Card>
                </Flex>
              </Col>
            </Row>
            <Row style={{ marginTop: 16, width: "100%" }}>
              <CardWithContent
                bodyStyles={{
                  padding: 0,
                }}
                title={t("models.titles.modelDetails")}
              >
                {<ModelDetails model={record} isLoading={isLoading} />}
              </CardWithContent>
            </Row>
            <Row style={{ marginTop: 16 }}>
              <CardWithContent
                bodyStyles={{
                  padding: 0,
                }}
                title={t("models.titles.events")}
              >
                {<ModelTimeline height={"410px"} modelId={record?.model_id} />}
              </CardWithContent>
            </Row>
          </Col>
        </Row>
      </List>
    </>
  );
};
