import React, { useCallback, useMemo, useEffect, useState } from "react";
import { Row, Col, theme, Spin, Result, Alert } from "antd";
import { useTranslation } from "react-i18next";
import { List } from "@refinedev/antd";
import { useApiUrl, useCustom } from "@refinedev/core";
import {
  EnvironmentOutlined,
  LineChartOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import {
  CardWithPlot,
  AllPlantsMap,
  CardWithContent,
  OverviewChart,
} from "../../components";
import { IOverviewChartType, IPlantMapItem } from "../../interfaces";

// Types for new API data
interface PowerPlant {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  model_count: number;
}

interface Model {
  id: number;
  name: string;
  type: string;
  version: number;
  features: string[];
  plant_id: number;
  plant_name: string;
  is_active: boolean;
  file_type: string;
}

interface ForecastPoint {
  id: number;
  prediction_time: string;
  power_output: number;
}

// Constants
const CHART_HEIGHT = 400;
const MAP_HEIGHT = 600;
const CARD_MARGIN = 20;

const GRID_BREAKPOINTS = {
  xl: { chart: 12, map: 12 },
  lg: { chart: 12, map: 12 },
  md: 24,
  sm: 24,
  xs: 24,
} as const;

export const DashboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const API_URL = useApiUrl();

  // State for forecast data
  const [forecastData, setForecastData] = useState<IOverviewChartType[]>([]);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [forecastError, setForecastError] = useState<any>(null);

  // API calls with error handling
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

  // Fetch forecast data for the first active model
  const fetchForecastData = useCallback(async () => {
    setIsLoadingForecast(true);
    setForecastError(null);
    
    try {
      // 1. Get all power plants
      const plantsResponse = await fetch(`${API_URL}/power_plant`);
      if (!plantsResponse.ok) {
        throw new Error('Failed to fetch power plants');
      }
      const plants: PowerPlant[] = await plantsResponse.json();
      
      // 2. Find first plant with models
      const plantWithModels = plants.find(plant => plant.model_count > 0);
      if (!plantWithModels) {
        console.log('No plants with models found');
        setForecastData([]);
        return;
      }
      
      // 3. Get models for that plant
      const modelsResponse = await fetch(`${API_URL}/power_plant/${plantWithModels.id}/models`);
      if (!modelsResponse.ok) {
        throw new Error('Failed to fetch models');
      }
      const models: Model[] = await modelsResponse.json();
      
      // 4. Find first active model
      const activeModel = models.find(model => model.is_active);
      if (!activeModel) {
        console.log('No active models found');
        setForecastData([]);
        return;
      }
      
      // 5. Get timestamps for that model
      const timestampsResponse = await fetch(`${API_URL}/forecast/${activeModel.id}/timestamps`);
      if (!timestampsResponse.ok) {
        throw new Error('Failed to fetch timestamps');
      }
      const timestamps: string[] = await timestampsResponse.json();
      
      if (timestamps.length === 0) {
        console.log('No timestamps found');
        setForecastData([]);
        return;
      }
      
      // 6. Get latest timestamp (first in array)
      const latestTimestamp = timestamps[0];
      
      // 7. Get forecast data for that timestamp
      const forecastResponse = await fetch(
        `${API_URL}/forecast/time_of_forecast/${activeModel.id}?tof=${encodeURIComponent(latestTimestamp)}`
      );
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      const forecastPoints: ForecastPoint[] = await forecastResponse.json();
      
      // 8. Transform data to match OverviewChart format
      const transformedData: IOverviewChartType[] = forecastPoints.map(point => ({
        date: point.prediction_time,
        value: point.power_output,
        type: "forecast" as const,
        plant: plantWithModels.name,
        measurement_unit: "W"
      }));
      
      setForecastData(transformedData);
      console.log(`Loaded forecast data for ${plantWithModels.name} - ${activeModel.name} (${latestTimestamp})`);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      setForecastError(error);
      setForecastData([]);
    } finally {
      setIsLoadingForecast(false);
    }
  }, [API_URL]);

  // Fetch forecast data on component mount
  useEffect(() => {
    fetchForecastData();
  }, [fetchForecastData]);

  // Memoized data processing
  const processedMapData = useMemo(() => {
    if (!mapData?.data) return [];
    return mapData.data as IPlantMapItem[];
  }, [mapData?.data]);

  // Memoized loading states
  const isLoading = useMemo(() => {
    return isLoadingForecast || isMapDataLoading;
  }, [isLoadingForecast, isMapDataLoading]);

  const hasErrors = useMemo(() => {
    return !!forecastError || !!mapError;
  }, [forecastError, mapError]);

  // Callbacks for retry actions
  const handleRetryChart = useCallback(() => {
    console.log("Retrying forecast data fetch...");
    fetchForecastData();
  }, [fetchForecastData]);

  const handleRetryMap = useCallback(() => {
    console.log("Retrying map data fetch...");
    refetchMapData();
  }, [refetchMapData]);

  const handleRetryAll = useCallback(() => {
    console.log("Retrying all dashboard data...");
    fetchForecastData();
    refetchMapData();
  }, [fetchForecastData, refetchMapData]);

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
        <Col 
          xl={GRID_BREAKPOINTS.xl.chart} 
          lg={GRID_BREAKPOINTS.lg.chart} 
          md={GRID_BREAKPOINTS.md} 
          sm={GRID_BREAKPOINTS.sm} 
          xs={GRID_BREAKPOINTS.xs}
        >
          <CardWithPlot
            icon={<LineChartOutlined style={iconStyle} />}
            title={t("dashboard.overview.title", "Latest Forecast")}
            bodyStyles={cardStyles.chart}
          >
            {forecastError ? 
              renderComponentError(
                forecastError, 
                t("dashboard.errors.chartError", "Chart Error"),
                handleRetryChart
              ) : (
                <OverviewChart
                  data={forecastData}
                  height={CHART_HEIGHT}
                  loading={isLoadingForecast}
                />
              )
            }
          </CardWithPlot>
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
      </Row>
    </List>
  );
};
