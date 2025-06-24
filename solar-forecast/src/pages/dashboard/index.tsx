import React, { useCallback, useMemo } from "react";
import { Row, Col, theme, Spin, Result, Alert } from "antd";
import { useTranslation } from "react-i18next";
import { List } from "@refinedev/antd";
import { useApiUrl, useCustom } from "@refinedev/core";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import {
  CardWithPlot,
  AllPlantsMap,
  ModelTimeline,
  CardWithContent,
  OverviewChart,
} from "../../components";
import { IOverviewChartType, IPlantMapItem } from "../../interfaces";

// Constants
const CHART_HEIGHT = 270;
const MAP_HEIGHT = 600;
const TIMELINE_HEIGHT = 600;
const CARD_MARGIN = 20;

const GRID_BREAKPOINTS = {
  xl: { map: 15, timeline: 9 },
  lg: { map: 15, timeline: 9 },
  md: 24,
  sm: 24,
  xs: 24,
} as const;

export const DashboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const API_URL = useApiUrl();

  // API calls with error handling
  const {
    data: chartData,
    isLoading: isChartDataLoading,
    error: chartError,
    refetch: refetchChartData,
  } = useCustom({
    url: `${API_URL}/dashboard/production_data`,
    method: "get",
    errorNotification: {
      type: "error",
      message: t("dashboard.errors.chartDataFailed", "Failed to load chart data"),
      description: t("dashboard.errors.pleaseTryAgain", "Please try again later"),
    },
  });

  const {
    data: mapData,
    isLoading: isMapDataLoading,
    error: mapError,
    refetch: refetchMapData,
  } = useCustom({
    url: `${API_URL}/power_plant/overview`,
    method: "get",
    errorNotification: {
      type: "error",
      message: t("dashboard.errors.mapDataFailed", "Failed to load map data"),
      description: t("dashboard.errors.pleaseTryAgain", "Please try again later"),
    },
  });

  // Memoized data processing
  const processedChartData = useMemo(() => {
    if (!chartData?.data) return [];
    return chartData.data as IOverviewChartType[];
  }, [chartData?.data]);

  const processedMapData = useMemo(() => {
    if (!mapData?.data) return [];
    return mapData.data as IPlantMapItem[];
  }, [mapData?.data]);

  // Memoized loading states
  const isLoading = useMemo(() => {
    return isChartDataLoading || isMapDataLoading;
  }, [isChartDataLoading, isMapDataLoading]);

  const hasErrors = useMemo(() => {
    return !!chartError || !!mapError;
  }, [chartError, mapError]);

  // Callbacks for retry actions
  const handleRetryChart = useCallback(() => {
    console.log("Retrying chart data fetch...");
    refetchChartData();
  }, [refetchChartData]);

  const handleRetryMap = useCallback(() => {
    console.log("Retrying map data fetch...");
    refetchMapData();
  }, [refetchMapData]);

  const handleRetryAll = useCallback(() => {
    console.log("Retrying all dashboard data...");
    refetchChartData();
    refetchMapData();
  }, [refetchChartData, refetchMapData]);

  // Memoized card styles
  const cardStyles = useMemo(() => ({
    chart: {
      height: `${CHART_HEIGHT}px`,
      padding: 0,
      margin: `${CARD_MARGIN}px`,
    },
    map: {
      height: `${MAP_HEIGHT}px`,
      overflow: "hidden" as const,
      padding: 0,
    },
    timeline: {
      height: `${TIMELINE_HEIGHT}px`,
      padding: 0,
    },
  }), []);

  // Memoized icon styles
  const iconStyle = useMemo(() => ({
    fontSize: 14,
    color: token.colorPrimary,
  }), [token.colorPrimary]);

  // Render loading state
  const renderLoadingSpinner = useCallback((height?: string) => (
    <Spin
      size="large"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: height || "100%",
      }}
    />
  ), []);

  // Render error state for individual components
  const renderComponentError = useCallback((
    error: any,
    title: string,
    onRetry: () => void
  ) => (
    <Result
      status="error"
      icon={<ExclamationCircleOutlined />}
      title={title}
      subTitle={t("dashboard.errors.componentError", "Unable to load component data")}
      extra={
        <Alert
          message={t("dashboard.errors.tryRefresh", "Try refreshing the page or contact support if the problem persists")}
          type="warning"
          showIcon
          action={
            <span
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={onRetry}
            >
              {t("common.retry", "Retry")}
            </span>
          }
        />
      }
    />
  ), [t]);

  // Early return for critical errors
  if (hasErrors && !isLoading) {
    return (
      <List title={t("dashboard.title", "Dashboard")}>
        <Result
          status="error"
          title={t("dashboard.errors.loadingFailed", "Failed to Load Dashboard")}
          subTitle={t("dashboard.errors.dataUnavailable", "Dashboard data is currently unavailable")}
          extra={
            <Alert
              message={t("dashboard.errors.checkConnection", "Please check your internet connection and try again")}
              type="error"
              showIcon
              action={
                <span
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={handleRetryAll}
                >
                  {t("common.retryAll", "Retry All")}
                </span>
              }
            />
          }
        />
      </List>
    );
  }

  return (
    <List title={t("dashboard.title", "Dashboard")}>
      <Row gutter={[16, 16]}>
        {/* Chart Section */}
        <Col md={24}>
          <Row gutter={[16, 16]}>
            <Col 
              xl={{ span: 24 }} 
              lg={24} 
              md={GRID_BREAKPOINTS.md} 
              sm={GRID_BREAKPOINTS.sm} 
              xs={GRID_BREAKPOINTS.xs}
            >
              <CardWithPlot
                icon={<LineChartOutlined style={iconStyle} />}
                title={t("dashboard.overview.title", "Overview")}
                bodyStyles={cardStyles.chart}
              >
                {chartError ? 
                  renderComponentError(
                    chartError, 
                    t("dashboard.errors.chartError", "Chart Error"),
                    handleRetryChart
                  ) : (
                    <OverviewChart
                      data={processedChartData}
                      height={CHART_HEIGHT}
                      loading={isChartDataLoading}
                    />
                  )
                }
              </CardWithPlot>
            </Col>
          </Row>
        </Col>

        {/* Map Section */}
        <Col 
          xl={GRID_BREAKPOINTS.xl.map} 
          lg={GRID_BREAKPOINTS.lg.map} 
          md={GRID_BREAKPOINTS.md} 
          sm={GRID_BREAKPOINTS.sm} 
          xs={GRID_BREAKPOINTS.xs}
        >
          <CardWithContent
            bodyStyles={cardStyles.map}
            icon={<EnvironmentOutlined style={iconStyle} />}
            title={t("dashboard.map.title", "Map")}
          >
            {mapError ? 
              renderComponentError(
                mapError, 
                t("dashboard.errors.mapError", "Map Error"),
                handleRetryMap
              ) : isMapDataLoading ? 
                renderLoadingSpinner() : (
                  <AllPlantsMap data={processedMapData} />
                )
            }
          </CardWithContent>
        </Col>

        {/* Timeline Section */}
        <Col 
          xl={GRID_BREAKPOINTS.xl.timeline} 
          lg={GRID_BREAKPOINTS.lg.timeline} 
          md={GRID_BREAKPOINTS.md} 
          sm={GRID_BREAKPOINTS.sm} 
          xs={GRID_BREAKPOINTS.xs}
        >
          <CardWithContent
            bodyStyles={cardStyles.timeline}
            icon={<ClockCircleOutlined style={iconStyle} />}
            title={t("dashboard.timeline.title", "Timeline")}
          >
            {isChartDataLoading ? 
              renderLoadingSpinner() : (
                <ModelTimeline height={`${TIMELINE_HEIGHT}px`} />
              )
            }
          </CardWithContent>
        </Col>
      </Row>
    </List>
  );
};
