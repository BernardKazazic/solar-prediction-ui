import { useState, useEffect } from "react";
import { useApiUrl, useCustom, useParsed, useTranslate } from "@refinedev/core";
import {
  Button,
  Row,
  Typography,
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

type DataType = {
  date: string;
  [key: string]: any;
};
type TablePagination<T extends object> = NonNullable<
  Exclude<TableProps<T>["pagination"], boolean>
>;
type TablePaginationPosition<T extends object> = NonNullable<
  TablePagination<T>["position"]
>[number];

interface IForecastData {
  id: number;
  prediction_time: string;
  power_output: number;
}

const CheckboxGroup = Checkbox.Group;
const { RangePicker } = DatePicker;
const { Title } = Typography;

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
      title: `${model}`,
      dataIndex: model,
      key: model,
    });
  });

  return columns;
};

const exportToCSV = (data: any[]) => {
  const csvRows = [];
  const headers = [
    "date",
    ...Object.keys(data[0] || {}).filter((key) => key !== "date"),
  ];
  csvRows.push(headers.join(","));

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
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [allForecastData, setAllForecastData] = useState<any[]>([]);
  const [isLoadingForecasts, setIsLoadingForecasts] = useState(false);

  const [bottom, setBottom] =
    useState<TablePaginationPosition<DataType>>("bottomRight");

  const API_URL = useApiUrl();

  // Get all models for this plant
  const { data: modelsData, isLoading: isLoadingModels } = useCustom<Model[]>({
    url: `${API_URL}/power_plant/${plantId}/models`,
    method: "get",
    queryOptions: {
      enabled: !!plantId,
    },
  });

  // Get query parameters for forecast requests
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
  const fetchAllForecasts = async () => {
    if (!modelsData?.data || modelsData.data.length === 0) {
      setAllForecastData([]);
      return;
    }

    setIsLoadingForecasts(true);
    try {
      const queryParams = getQueryParams();
      const forecastPromises = modelsData.data.map(async (model) => {
        try {
          const response = await fetch(
            `${API_URL}/forecast/${model.id}?${new URLSearchParams(queryParams)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          
          if (!response.ok) {
            console.warn(`Failed to fetch forecast for model ${model.name}`);
            return [];
          }
          
          const data: IForecastData[] = await response.json();
          return data.map(item => ({
            date: item.prediction_time,
            value: item.power_output,
            source: model.name,
            measurement_unit: "W",
          }));
        } catch (error) {
          console.warn(`Error fetching forecast for model ${model.name}:`, error);
          return [];
        }
      });

      const forecastResults = await Promise.all(forecastPromises);
      const combinedForecasts = forecastResults.flat();
      setAllForecastData(combinedForecasts);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      message.error(t("Failed to load forecasts"));
    } finally {
      setIsLoadingForecasts(false);
    }
  };

  // Fetch forecasts when models data changes or date range changes
  useEffect(() => {
    fetchAllForecasts();
  }, [modelsData, dateRange]);

  const handleDateChange = (dates: any[]) => {
    if (dates[0] && dates[1]) {
      const [start, end] = dates;
      if (end.isBefore(start)) {
        message.error(t("chart.endDateMustBeAfterStart"));
        return;
      }
      const startDate = dates[0].format("YYYY-MM-DDTHH:mm:ss") + "Z";
      const endDate = dates[1].format("YYYY-MM-DDTHH:mm:ss") + "Z";
      setDateRange([startDate, endDate]);
    }
  };

  const [checkedList, setCheckedList] = useState<string[]>([]);

  // Get available models from forecast data
  const availableModels = [
    ...new Set(allForecastData.map((item) => item.source)),
  ];

  useEffect(() => {
    if (allForecastData.length > 0) {
      setCheckedList(availableModels);
    }
  }, [allForecastData]);

  const filteredData = allForecastData.reduce<{ [key: string]: any }[]>(
    (acc, item) => {
      if (checkedList.includes(item.source)) {
        const existingEntry = acc.find(
          (entry) => entry.date === dayjs(item.date).format("DD.MM.YYYY HH:mm")
        );
        if (existingEntry) {
          existingEntry[item.source] = item.value + " " + item.measurement_unit;
        } else {
          acc.push({
            date: dayjs(item.date).format("DD.MM.YYYY HH:mm"),
            [item.source]: item.value + " " + item.measurement_unit,
          });
        }
      }
      return acc;
    },
    []
  );

  const chartProps = {
    data: allForecastData.filter(item => checkedList.includes(item.source)) || [],
    xField: "date",
    yField: "value",
    seriesField: "source",
    xAxis: {
      range: [0, 1],
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
      fields: ["date", "value", "source", "measurement_unit"],
      formatter: (data: any) => {
        const formattedDate = dayjs(data.date).format("DD.MM.YYYY HH:mm");
        return {
          title: formattedDate,
          name: data.source,
          value: `${data.value.toFixed(2)} ${data.measurement_unit}`,
        };
      },
    },
  };

  const [view, setView] = useState<"chart" | "table">("chart");

  const isLoadingOrRefetchingForecast = isLoadingModels || isLoadingForecasts;

  return (
    <>
      <Row>
        <RangePicker
          showTime={{ format: "HH:mm", minuteStep: 15 }}
          format="DD.MM.YYYY HH:mm"
          maxDate={dayjs().add(72, "hour")}
          onOk={(value) => handleDateChange(value)}
        />
        <Segmented
          options={[
            { label: t("common.chart"), value: "chart", icon: <LineChartOutlined /> },
            {
              label: t("common.table"),
              value: "table",
              icon: <UnorderedListOutlined />,
            },
          ]}
          value={view}
          onChange={setView}
          style={{ marginLeft: "20px" }}
        />
      </Row>
      <Divider style={{ margin: "13px 0" }} />
      <Alert
        message={t("chart.forecastInfoMessage")}
        type="info"
        showIcon
        style={{ marginBottom: "16px" }}
        closable
      />
      <Row>
        {view === "chart" ? (
          <Line
            {...chartProps}
            style={{ width: "100%", height: "440px" }}
            loading={isLoadingOrRefetchingForecast}
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
                onClick={() => exportToCSV(filteredData || [])}
                style={{ marginLeft: "auto" }}
                disabled={filteredData?.length === 0}
                icon={<ExportOutlined />}
              >
                {t("common.exportCsv")}
              </Button>
            </Flex>

            <Table
              dataSource={filteredData}
              columns={generateTableColumns(checkedList, t)}
              pagination={{ position: [bottom] }}
              style={{ width: "100%", height: "100%" }}
              size={"middle"}
              loading={isLoadingOrRefetchingForecast}
            />
          </>
        )}
      </Row>
    </>
  );
};
