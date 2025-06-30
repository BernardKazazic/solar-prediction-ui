import { useShow, useTranslate } from "@refinedev/core";
import type { Plant } from "../../interfaces";
import { Breadcrumb, EditButton, List, ListButton } from "@refinedev/antd";
import { Col, Flex, Row, Skeleton, Button } from "antd";
import { LeftOutlined, UploadOutlined } from "@ant-design/icons";
import {
  CardWithContent,
  PlantLocation,
  PlantDetails,
  PlantForecasts,
  PlantTofForecasts,
  PlantModels,
  PlantShareButton,
  PlantReadingsUploadModal,
} from "../../components";
import { useState } from "react";

export const PlantShow = () => {
  const t = useTranslate();
  const { query: queryResult } = useShow<Plant>();
  const { data, isLoading } = queryResult;
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

  const record = data?.data;

  const handleUploadClick = () => {
    setIsUploadModalVisible(true);
  };

  const handleUploadModalClose = () => {
    setIsUploadModalVisible(false);
  };

  return (
    <>
      <Flex style={{ marginBottom: "10px" }}>
        <ListButton icon={<LeftOutlined />}>
          {t("powerPlants.power_plants")}
        </ListButton>
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
        headerButtons={
          <>
            <Button
              icon={<UploadOutlined />}
              onClick={handleUploadClick}
            >
              {t("plants.uploadReadings.button")}
            </Button>
            <EditButton />
            <PlantShareButton powerPlantId={record?.id} />
          </>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <Flex gap={16} vertical>
              <CardWithContent
                bodyStyles={{
                  minHeight: "550px",
                  overflow: "hidden",
                  padding: "1em 1em 0",
                }}
                title={t("plants.titles.forecast")}
              >
                {<PlantForecasts />}
              </CardWithContent>
              <CardWithContent
                bodyStyles={{
                  minHeight: "550px",
                  overflow: "hidden",
                  padding: "1em 1em 0",
                }}
                title={t("plants.titles.tofForecast")}
              >
                {<PlantTofForecasts />}
              </CardWithContent>
            </Flex>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xl={15} lg={24} md={24} sm={24} xs={24}>
            <Flex gap={16} vertical>
              <CardWithContent
                bodyStyles={{
                  padding: "1em",
                }}
                title={t("plants.titles.models", "Models")}
              >
                {<PlantModels plant={record} />}
              </CardWithContent>
              <CardWithContent
                bodyStyles={{
                  height: "378px",
                  overflow: "hidden",
                  padding: 0,
                }}
                title={t("plants.titles.location")}
              >
                {<PlantLocation plant={record} />}
              </CardWithContent>
            </Flex>
          </Col>

          <Col xl={9} lg={24} md={24} sm={24} xs={24}>
            <CardWithContent
              bodyStyles={{
                padding: 0,
              }}
              title={t("plants.titles.plantDetails")}
            >
              {<PlantDetails plant={record} isLoading={isLoading} />}
            </CardWithContent>
          </Col>
        </Row>
      </List>

      <PlantReadingsUploadModal
        visible={isUploadModalVisible}
        onClose={handleUploadModalClose}
        plantId={record?.id}
      />
    </>
  );
};
