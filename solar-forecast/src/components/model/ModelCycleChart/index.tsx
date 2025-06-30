import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useApiUrl, useCustom, useParsed, useTranslate } from "@refinedev/core";
import { Line } from "@ant-design/plots";
import { DatePicker, Space, Typography } from "antd";
import { CardWithContent } from "../../card";
import { CycleData } from "../../../interfaces";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

export interface ModelCycleChartRef {
  refetch: () => void;
}

export const ModelCycleChart = forwardRef<ModelCycleChartRef>((props, ref) => {
  const t = useTranslate();
  const { id: modelId } = useParsed();
  const API_URL = useApiUrl();

  const getCurrentWeekRange = (): [Dayjs, Dayjs] => {
    const now = dayjs();
    // Use Monday as start of week (European standard)
    const dayOfWeek = now.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, otherwise go back (dayOfWeek - 1) days
    const startOfWeek = now.subtract(daysFromMonday, 'day').startOf('day');
    const endOfWeek = startOfWeek.add(6, 'day').endOf('day');
    return [startOfWeek, endOfWeek];
  };

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(getCurrentWeekRange());

  const formatDate = (date: Dayjs): string => {
    return date.format('YYYY-MM-DD');
  };

  const {
    data: cycleData,
    isLoading: isCycleDataLoading,
    isFetching: isCycleDataFetching,
    error,
    refetch,
  } = useCustom<CycleData[]>({
    url: `${API_URL}/metric/cycle/${modelId}`,
    method: "get",
    config: {
      query: {
        start_date: formatDate(dateRange[0]),
        end_date: formatDate(dateRange[1]),
      },
    },
    queryOptions: {
      enabled: !!modelId,
    },
  });

  // Expose refetch function to parent via ref
  useImperativeHandle(ref, () => ({
    refetch,
  }));

  const isLoadingOrRefetchingCycle = isCycleDataLoading || isCycleDataFetching;

  useEffect(() => {
    if (modelId) {
      refetch();
    }
  }, [dateRange, modelId, refetch]);

  const chartData = (cycleData?.data || [])
    .map((item) => {
      const timeValue = dayjs(item.time_of_forecast).valueOf();
      const value = parseFloat(item.value);
      
      if (isNaN(value)) {
        return null;
      }
      
      return {
        time_of_forecast: item.time_of_forecast,
        timestamp: timeValue,
        value: value,
        metric_type: item.metric_type,
      };
    })
    .filter((item): item is { 
      time_of_forecast: string; 
      timestamp: number; 
      value: number; 
      metric_type: string;
    } => item !== null)
    .sort((a, b) => a.timestamp - b.timestamp);

  const chartProps = {
    data: chartData,
    xField: "time_of_forecast",
    yField: "value",
    seriesField: "metric_type",
    xAxis: {
      title: {
        text: t("models.cycle.xAxis", "Time of Forecast"),
      },
      type: 'time' as const,
      tickCount: 5,
    },
    yAxis: {
      title: {
        text: t("models.cycle.yAxis", "Value"),
      },
    },
    tooltip: {
      formatter: (data: any) => ({
        title: dayjs(data.time_of_forecast).format('MMM DD, YYYY HH:mm'),
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
    color: ['#1890ff', '#52c41a', '#fa541c'], // Distinct colors for MAE, RMSE, MBE
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  if (error) {
    console.error('Cycle data error:', error);
  }

  if (!isLoadingOrRefetchingCycle && chartData.length === 0) {
    return (
      <CardWithContent
        title={t("models.cycle.title", "Cycle Analysis")}
        bodyStyles={{
          height: "400px",
          overflow: "hidden",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Space style={{ marginBottom: 16 }}>
          <Typography.Text strong>
            {t("models.cycle.dateRange", "Date Range:")}
          </Typography.Text>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </Space>
        <div style={{ 
          textAlign: "center", 
          color: "#999", 
          flex: 1, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          {error ? "Error loading cycle data" : "No cycle data available for the selected date range"}
        </div>
      </CardWithContent>
    );
  }

  return (
    <CardWithContent
      title={t("models.cycle.title", "Cycle Analysis")}
      bodyStyles={{
        height: "500px",
        overflow: "hidden",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Space style={{ marginBottom: 16 }}>
        <Typography.Text strong>
          {t("models.cycle.dateRange", "Date Range:")}
        </Typography.Text>
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="YYYY-MM-DD"
          allowClear={false}
        />
      </Space>
      <div style={{ flex: 1 }}>
        <Line
          {...chartProps}
          style={{ width: "100%", height: "100%" }}
          loading={isLoadingOrRefetchingCycle}
          animation={false}
          autoFit
        />
      </div>
    </CardWithContent>
  );
}); 