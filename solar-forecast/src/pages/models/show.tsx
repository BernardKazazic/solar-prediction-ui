import { useShow, useTranslate } from "@refinedev/core";
import type { Model } from "../../interfaces";
import { Breadcrumb, EditButton, List, ListButton } from "@refinedev/antd";
import { Button, Col, Flex, Row, Skeleton } from "antd";
import { LeftOutlined, SettingOutlined } from "@ant-design/icons";
import {
  CardWithContent,
  ModelDetails,
} from "../../components";
import { ModelHorizonChart, ModelCycleChart } from "../../components/model";

export const ModelShow = () => {
  const t = useTranslate();
  const { query: queryResult } = useShow<Model>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const handleCustomDatasetRun = () => {
    // Currently does nothing as requested
    console.log("Run with custom dataset clicked");
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
              <ModelHorizonChart />
              <ModelCycleChart />
            </Flex>
          </Col>
        </Row>
      </List>
    </>
  );
};
