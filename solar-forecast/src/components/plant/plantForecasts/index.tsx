import { useState, useEffect } from "react";
import { useApiUrl, useCustom, useParsed, useTranslate } from "@refinedev/core";
import {
  Button,
  Row,
  Table,
  Segmented,
  Divider,
  Checkbox,
  DatePicker,
  message,
  Flex,
  Alert,
} from "antd";
import { Line } from "@ant-design/plots";
import dayjs from "dayjs";
import type { TableProps } from "antd";
import {
  ExportOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Model } from "../../../interfaces";

// Types
type DataType = {
  date: string;
  [key: string]: any;
};

type TablePaginationPosition<T extends object> = NonNullable<
  NonNullable<Exclude<TableProps<T>["pagination"], boolean>>["position"]
>[number];

interface ForecastPoint {
  id: number;
  prediction_time: string;
  power_output: number;
}

interface ReadingPoint {
  id: number;
  timestamp: string;
  power_w: number;
}

interface ChartDataPoint {
  date: string;
  value: number;
  source: string;
  measurement_unit: string;
}

// Constants
const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;

// Utilities
const generateTableColumns = (checkedList: string[], t: any) => {
  const columns = [
    {
      title: t("chart.date"),
      dataIndex: "date",
      key: "date",
    },
  ];

  checkedList.forEach((model) => {
    columns.push({
      title: model,
      dataIndex: model,
      key: model,
    });
  });

  return columns;
};

const exportToCSV = (data: any[]) => {
  if (data.length === 0) return;

  const headers = ["date", ...Object.keys(data[0] || {}).filter((key) => key !== "date")];
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header] !== undefined ? row[header] : "";
      return typeof value === "string" ? `"${value}"` : value;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "forecast_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const PlantForecasts = () => {
  const t = useTranslate();
  const { id: plantId } = useParsed();
  const API_URL = useApiUrl();

  // Core state
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [view, setView] = useState<"chart" | "table">("chart");
  const [checkedList, setCheckedList] = useState<string[]>([]);
  
  // Data state
  const [forecastData, setForecastData] = useState<ChartDataPoint[]>([]);
  const [readingsData, setReadingsData] = useState<ChartDataPoint[]>([]);
  
  // Loading state
  const [isLoadingForecasts, setIsLoadingForecasts] = useState(false);
  const [isLoadingReadings, setIsLoadingReadings] = useState(false);
  
  // UI state
  const [showReadings, setShowReadings] = useState(false);
  const [bottom] = useState<TablePaginationPosition<DataType>>("bottomRight");

  // Get models data
  const { data: modelsData, isLoading: isLoadingModels } = useCustom<Model[]>({
    url: `${API_URL}/power_plant/${plantId}/models`,
    method: "get",
    queryOptions: {
      enabled: !!plantId,
    },
  });

  // Get query parameters for API calls
  const getQueryParams = () => {
    if (dateRange) {
      return {
        start_date: dateRange[0],
        end_date: dateRange[1],
      };
    }
    
    // Default: current time to 72 hours ahead
    const defaultStart = dayjs().format("YYYY-MM-DDTHH:mm:ss") + "Z";
    const defaultEnd = dayjs().add(72, "hour").format("YYYY-MM-DDTHH:mm:ss") + "Z";
    
    return {
      start_date: defaultStart,
      end_date: defaultEnd,
    };
  };

  // Fetch forecasts for all models
  const fetchForecasts = async () => {
    if (!modelsData?.data || modelsData.data.length === 0) {
      setForecastData([]);
      return;
    }

    setIsLoadingForecasts(true);
    try {
      const queryParams = getQueryParams();
      const forecastPromises = modelsData.data.map(async (model) => {
        try {
          const response = await fetch(
            `${API_URL}/forecast/${model.id}?${new URLSearchParams(queryParams)}`
          );
          
          if (!response.ok) {
            console.warn(`Failed to fetch forecast for model ${model.name}`);
            return [];
          }
          
          const data: ForecastPoint[] = await response.json();
          return data.map(point => ({
            date: point.prediction_time,
            value: point.power_output,
            source: model.name,
            measurement_unit: "W",
          }));
        } catch (error) {
          console.warn(`Error fetching forecast for model ${model.name}:`, error);
          return [];
        }
      });

      const results = await Promise.all(forecastPromises);
      const combinedData = results.flat();
      setForecastData(combinedData);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      message.error(t("Failed to load forecasts"));
    } finally {
      setIsLoadingForecasts(false);
    }
  };

  // Fetch readings data
  const fetchReadings = async () => {
    if (!plantId) return;
    
    setIsLoadingReadings(true);
    try {
      const queryParams = getQueryParams();
      const response = await fetch(`${API_URL}/reading/${plantId}?${new URLSearchParams(queryParams)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch readings');
      }
      
      const data: ReadingPoint[] = await response.json();
      const formattedReadings: ChartDataPoint[] = data.map(point => ({
        date: point.timestamp,
        value: point.power_w,
        source: t("plants.readingsCapitalized"),
        measurement_unit: "W",
      }));
      
      setReadingsData(formattedReadings);
    } catch (error) {
      console.error('Error fetching readings:', error);
      message.error(t('Failed to load readings'));
      setReadingsData([]);
    } finally {
      setIsLoadingReadings(false);
    }
  };

  // Handle date range change
  const handleDateChange = (dates: any[]) => {
    if (dates && dates[0] && dates[1]) {
      const [start, end] = dates;
      if (end.isBefore(start)) {
        message.error(t("chart.endDateMustBeAfterStart"));
        return;
      }
      const startDate = start.format("YYYY-MM-DDTHH:mm:ss") + "Z";
      const endDate = end.format("YYYY-MM-DDTHH:mm:ss") + "Z";
      setDateRange([startDate, endDate]);
    }
  };

  // Handle readings toggle
  const handleReadingsToggle = (checked: boolean) => {
    setShowReadings(checked);
    if (checked) {
      fetchReadings();
    } else {
      setReadingsData([]);
    }
  };

  // Effects
  useEffect(() => {
    fetchForecasts();
  }, [modelsData, dateRange]);

  useEffect(() => {
    if (showReadings) {
      fetchReadings();
    }
  }, [dateRange]);

  // Get available models and auto-select them
  const availableModels = [
    ...new Set([
      ...forecastData.map(item => item.source),
      ...(showReadings ? readingsData.map(item => item.source) : [])
    ])
  ];

  useEffect(() => {
    if (availableModels.length > 0) {
      setCheckedList(availableModels);
    }
  }, [forecastData, readingsData, showReadings]);

  // Prepare chart data (similar to TOF chart pattern)
  const chartData = [
    // Sorted forecast data
    ...forecastData
      .filter(item => checkedList.includes(item.source))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()),
    // Sorted readings data if enabled
    ...(showReadings ? readingsData
      .filter(item => checkedList.includes(item.source))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()) : [])
  ];

  // Prepare table data
  const tableData = (() => {
    const combinedData = [...forecastData, ...(showReadings ? readingsData : [])];
    const filteredData = combinedData.filter(item => checkedList.includes(item.source));
    
    return filteredData.reduce<{ [key: string]: any }[]>((acc, item) => {
      const existingEntry = acc.find(
        entry => entry.date === dayjs(item.date).format("DD.MM.YYYY HH:mm")
      );
      
      if (existingEntry) {
        existingEntry[item.source] = `${item.value} ${item.measurement_unit}`;
      } else {
        acc.push({
          date: dayjs(item.date).format("DD.MM.YYYY HH:mm"),
          [item.source]: `${item.value} ${item.measurement_unit}`,
        });
      }
      
      return acc;
    }, []);
  })();

  // Chart configuration
  const chartProps = {
    data: chartData,
    xField: "date",
    yField: "value",
    seriesField: "source",
    xAxis: {
      type: 'time' as const,
      label: {
        formatter: (v: string) => dayjs(v).format("DD.MM. HH:mm"),
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v} W`,
      },
    },
    tooltip: {
      formatter: (data: any) => ({
        title: dayjs(data.date).format("DD.MM.YYYY HH:mm"),
        name: data.source,
        value: `${data.value.toFixed(2)} W`,
      }),
    },
  };

  const isChartLoading = isLoadingModels || isLoadingForecasts;
  const isTableLoading = isLoadingModels || isLoadingForecasts || isLoadingReadings;

  return (
    <>
      {/* Controls */}
      <Row>
        <RangePicker
          showTime={{ format: "HH:mm", minuteStep: 15 }}
          format="DD.MM.YYYY HH:mm"
          maxDate={dayjs().add(72, "hour")}
          onOk={handleDateChange}
        />
        <Segmented
          options={[
            { label: t("common.chart"), value: "chart", icon: <LineChartOutlined /> },
            { label: t("common.table.label"), value: "table", icon: <UnorderedListOutlined /> },
          ]}
          value={view}
          onChange={setView}
          style={{ marginLeft: "20px" }}
        />
      </Row>

      <Divider style={{ margin: "13px 0" }} />

      {/* Info Alert */}
      <Alert
        message={t("chart.forecastInfoMessage")}
        type="info"
        showIcon
        style={{ marginBottom: "16px" }}
        closable
      />

      {/* Readings Toggle */}
      <Row style={{ marginBottom: "16px" }}>
        <Checkbox
          checked={showReadings}
          onChange={(e) => handleReadingsToggle(e.target.checked)}
          disabled={isLoadingReadings}
        >
          {t("tofForecasts.showReadings")} {isLoadingReadings && `(${t("common.loading")}...)`}
        </Checkbox>
        {showReadings && readingsData.length > 0 && (
          <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
            ({readingsData.length} {t("tofForecasts.readingsLoaded")})
          </span>
        )}
      </Row>

      {/* Chart or Table */}
      <Row>
        {view === "chart" ? (
          <Line
            {...chartProps}
            style={{ width: "100%", height: "440px" }}
            loading={isChartLoading}
          />
        ) : (
          <>
            <Flex
              align="center"
              justify="space-between"
              style={{ width: "100%", marginBottom: "15px" }}
            >
              <CheckboxGroup
                options={availableModels}
                value={checkedList}
                onChange={setCheckedList}
              />
              <Button
                onClick={() => exportToCSV(tableData)}
                disabled={tableData.length === 0}
                icon={<ExportOutlined />}
              >
                {t("common.exportCsv")}
              </Button>
            </Flex>

            <Table
              dataSource={tableData}
              columns={generateTableColumns(checkedList, t)}
              pagination={{ position: [bottom] }}
              style={{ width: "100%", height: "100%" }}
              size="middle"
              loading={isTableLoading}
            />
          </>
        )}
      </Row>
    </>
  );
};
