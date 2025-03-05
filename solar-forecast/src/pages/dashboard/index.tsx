import { Row, Col, theme, Spin } from "antd";
import { useTranslation } from "react-i18next";
import {
  CardWithPlot,
  AllPlantsMap,
  ModelTimeline,
  CardWithContent,
  OverviewChart,
} from "../../components";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { List } from "@refinedev/antd";
import { useApiUrl, useCustom } from "@refinedev/core";
import { IOverviewChartType, IPlantMapItem } from "../../interfaces";

export const DashboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const API_URL = useApiUrl();

  const { data: chartData, isLoading: isChartDataLoading } = useCustom({
    url: `${API_URL}/dashboard/production_data`,
    method: "get",
  });

  const { data: mapData, isLoading: isMapDataLoading } = useCustom({
    url: `${API_URL}/dashboard/plant_overview`,
    method: "get",
  });

  return (
    <List title={t("dashboard.title", "Dashboard")}>
      <Row gutter={[16, 16]}>
        {/* Chart Section */}
        <Col md={24}>
          <Row gutter={[16, 16]}>
            <Col xl={{ span: 24 }} lg={24} md={24} sm={24} xs={24}>
              <CardWithPlot
                icon={
                  <LineChartOutlined
                    style={{
                      fontSize: 14,
                      color: token.colorPrimary,
                    }}
                  />
                }
                title={t("dashboard.overview.title", "Overview")}
                bodyStyles={{ height: "270px", padding: 0, margin: "20px" }}
              >
                {
                  <OverviewChart
                    data={chartData?.data as IOverviewChartType[]}
                    height={270}
                    loading={isChartDataLoading}
                  />
                }
              </CardWithPlot>
            </Col>
          </Row>
        </Col>

        {/* Map Section */}
        <Col xl={15} lg={15} md={24} sm={24} xs={24}>
          <CardWithContent
            bodyStyles={{
              height: "600px",
              overflow: "hidden",
              padding: 0,
            }}
            icon={
              <EnvironmentOutlined
                style={{
                  fontSize: 14,
                  color: token.colorPrimary,
                }}
              />
            }
            title={t("dashboard.map.title", "Map")}
          >
            {isMapDataLoading ? (
              <Spin
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              />
            ) : (
              <AllPlantsMap data={mapData?.data as IPlantMapItem[]} />
            )}
          </CardWithContent>
        </Col>

        <Col xl={9} lg={9} md={24} sm={24} xs={24}>
          <CardWithContent
            bodyStyles={{
              height: "600px",
              padding: 0,
            }}
            icon={
              <ClockCircleOutlined
                style={{
                  fontSize: 14,
                  color: token.colorPrimary,
                }}
              />
            }
            title={t("dashboard.timeline.title")}
          >
            {isChartDataLoading ? (
              <Spin
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              />
            ) : (
              <ModelTimeline height={"600px"} />
            )}
          </CardWithContent>
        </Col>
      </Row>
    </List>
  );
};
