import { useApiUrl, useCustom, useParsed, useTranslate } from "@refinedev/core";
import { Line } from "@ant-design/plots";
import { CardWithContent } from "../../card";
import { HorizonData } from "../../../interfaces";

export const ModelHorizonChart = () => {
  const t = useTranslate();
  const { id: modelId } = useParsed();
  const API_URL = useApiUrl();

  const {
    data: horizonData,
    isLoading: isHorizonDataLoading,
    isFetching: isHorizonDataFetching,
    error,
  } = useCustom<HorizonData[]>({
    url: `${API_URL}/metric/horizon/${modelId}`,
    method: "get",
    queryOptions: {
      enabled: !!modelId,
    },
  });

  const isLoadingOrRefetchingHorizon = isHorizonDataLoading || isHorizonDataFetching;

  const chartData = (horizonData?.data || [])
    .map((item) => {
      const horizonValue = parseFloat(item.horizon);
      const value = parseFloat(item.value);
      
      if (isNaN(horizonValue) || isNaN(value)) {
        return null;
      }
      
      return {
        horizon: horizonValue,
        value: value,
        metric_type: item.metric_type,
      };
    })
    .filter((item): item is { horizon: number; value: number; metric_type: string } => item !== null);

  const chartProps = {
    data: chartData,
    xField: "horizon",
    yField: "value",
    seriesField: "metric_type",
    xAxis: {
      title: {
        text: t("models.horizon.xAxis", "Horizon (hours)"),
      },
      type: 'cat' as const,
    },
    yAxis: {
      title: {
        text: t("models.horizon.yAxis", "Value"),
      },
    },
    tooltip: {
      formatter: (data: any) => ({
        title: `${t("models.horizon.tooltip", "Horizon")}: ${data.horizon}h`,
        name: data.metric_type,
        value: data.value.toFixed(2),
      }),
    },
    legend: {
      position: "top" as const,
    },
    smooth: true,
    point: {
      size: 4,
      shape: 'circle',
    },
    color: ['#1890ff', '#52c41a', '#fa541c'], // Distinct colors for different metric types
  };

  if (error) {
    console.error('Horizon data error:', error);
  }

  if (!isLoadingOrRefetchingHorizon && chartData.length === 0) {
    return (
      <CardWithContent
        title={t("models.horizon.title", "Horizon Analysis")}
        bodyStyles={{
          height: "400px",
          overflow: "hidden",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#999" }}>
          {error ? "Error loading horizon data" : "No horizon data available"}
        </div>
      </CardWithContent>
    );
  }

  return (
    <CardWithContent
      title={t("models.horizon.title", "Horizon Analysis")}
      bodyStyles={{
        height: "400px",
        overflow: "hidden",
        padding: "16px",
      }}
    >
      <Line
        {...chartProps}
        style={{ width: "100%", height: "100%" }}
        loading={isLoadingOrRefetchingHorizon}
        animation={false}
        autoFit
      />
    </CardWithContent>
  );
}; 