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
  Select,
  Switch,
  Space,
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

interface IReadingData {
  timestamp: string;
  power_w: number;
}

interface IChartData {
  date: string;
  value: number;
  source: string;
  measurement_unit: string;
  type: "forecast" | "reading";
}

const CheckboxGroup = Checkbox.Group;
const { Title } = Typography;
const { Option } = Select;

const generateTableColumns = (checkedSources: string[]) => {
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
  ];

  checkedSources.forEach((source) => {
    columns.push({
      title: `${source}`,
      dataIndex: source,
      key: source,
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
  link.setAttribute("download", "tof_forecast_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const PlantTofForecasts = () => {
  const t = useTranslate();
  const { id: plantId } = useParsed();
  const [allForecastData, setAllForecastData] = useState<IChartData[]>([]);
  const [isLoadingForecasts, setIsLoadingForecasts] = useState(false);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [selectedTofs, setSelectedTofs] = useState<string[]>([]);
  const [availableTofs, setAvailableTofs] = useState<{ [modelId: number]: string[] }>({});
  const [showReadings, setShowReadings] = useState(false);
  const [readingsData, setReadingsData] = useState<IChartData[]>([]);
  const [isLoadingReadings, setIsLoadingReadings] = useState(false);

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

  // Fetch available TOFs for selected models
  const fetchAvailableTofs = async () => {
    if (!selectedModels.length) {
      setAvailableTofs({});
      return;
    }

    try {
      const tofPromises = selectedModels.map(async (modelId) => {
        try {
          const response = await fetch(`${API_URL}/forecast/${modelId}/timestamps`);
          if (!response.ok) {
            console.warn(`Failed to fetch TOFs for model ${modelId}`);
            return { modelId, tofs: [] };
          }
          const tofs: string[] = await response.json();
          return { modelId, tofs };
        } catch (error) {
          console.warn(`Error fetching TOFs for model ${modelId}:`, error);
          return { modelId, tofs: [] };
        }
      });

      const tofResults = await Promise.all(tofPromises);
      const tofMap: { [modelId: number]: string[] } = {};
      
      tofResults.forEach(({ modelId, tofs }) => {
        tofMap[modelId] = tofs;
      });

      setAvailableTofs(tofMap);
    } catch (error) {
      console.error("Error fetching TOFs:", error);
    }
  };

  // Fetch forecasts for selected models and TOFs
  const fetchTofForecasts = async () => {
    if (!selectedModels.length || !selectedTofs.length) {
      setAllForecastData([]);
      return;
    }

    setIsLoadingForecasts(true);
    try {
      const forecastPromises: Promise<IChartData[]>[] = [];
      
      selectedModels.forEach((modelId) => {
        const model = modelsData?.data?.find(m => m.id === modelId);
        if (!model) return;

        selectedTofs.forEach((tof) => {
          const availableForModel = availableTofs[modelId] || [];
          if (availableForModel.includes(tof)) {
            forecastPromises.push(
              fetch(`${API_URL}/forecast/time_of_forecast/${modelId}?tof=${encodeURIComponent(tof)}`)
                .then(response => {
                  if (!response.ok) {
                    console.warn(`Failed to fetch forecast for model ${model.name} TOF ${tof}`);
                    return [];
                  }
                  return response.json();
                })
                .then((data: IForecastData[]) => 
                  data.map(item => ({
                    date: item.prediction_time,
                    value: item.power_output,
                    source: `${model.name} (${dayjs(tof).format("DD.MM.YYYY HH:mm")})`,
                    measurement_unit: "W",
                    type: "forecast" as const,
                  }))
                )
                .catch(error => {
                  console.warn(`Error fetching forecast for model ${model.name} TOF ${tof}:`, error);
                  return [];
                })
            );
          }
        });
      });

      const forecastResults = await Promise.all(forecastPromises);
      const combinedForecasts = forecastResults.flat();
      setAllForecastData(combinedForecasts);
    } catch (error) {
      console.error("Error fetching TOF forecasts:", error);
      message.error(t("Failed to load TOF forecasts"));
    } finally {
      setIsLoadingForecasts(false);
    }
  };

  // Fetch readings data
  const fetchReadings = async () => {
    if (!showReadings || !allForecastData.length) {
      setReadingsData([]);
      return;
    }

    setIsLoadingReadings(true);
    try {
      // Find the date range from forecasts
      const dates = allForecastData.map(item => dayjs(item.date));
      const startDate = dates.reduce((min, current) => current.isBefore(min) ? current : min, dates[0]);
      const endDate = dates.reduce((max, current) => current.isAfter(max) ? current : max, dates[0]);

      if (!startDate || !endDate) {
        setReadingsData([]);
        return;
      }

      const response = await fetch(
        `${API_URL}/reading/${plantId}?start_date=${startDate.format("YYYY-MM-DDTHH:mm:ss")}Z&end_date=${endDate.format("YYYY-MM-DDTHH:mm:ss")}Z`
      );

      if (!response.ok) {
        console.warn("Failed to fetch readings");
        setReadingsData([]);
        return;
      }

      const data: IReadingData[] = await response.json();
      const readingsChartData = data.map(item => ({
        date: item.timestamp,
        value: item.power_w,
        source: "Actual Readings",
        measurement_unit: "W",
        type: "reading" as const,
      }));

      setReadingsData(readingsChartData);
    } catch (error) {
      console.error("Error fetching readings:", error);
      setReadingsData([]);
    } finally {
      setIsLoadingReadings(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchAvailableTofs();
  }, [selectedModels]);

  useEffect(() => {
    fetchTofForecasts();
  }, [selectedModels, selectedTofs, availableTofs]);

  useEffect(() => {
    fetchReadings();
  }, [showReadings, allForecastData]);

  // Get all unique TOFs from available TOFs
  const allAvailableTofs = [...new Set(Object.values(availableTofs).flat())].sort((a, b) => 
    dayjs(b).valueOf() - dayjs(a).valueOf()
  );

  const [checkedList, setCheckedList] = useState<string[]>([]);

  // Get available sources from forecast and readings data
  const combinedData = [...allForecastData, ...readingsData];
  const availableSources = [...new Set(combinedData.map((item) => item.source))];

  useEffect(() => {
    if (combinedData.length > 0) {
      setCheckedList(availableSources);
    }
  }, [combinedData]);

  const filteredData = combinedData.reduce<{ [key: string]: any }[]>(
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
    data: combinedData.filter(item => checkedList.includes(item.source)) || [],
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
      fields: ["date", "value", "source", "measurement_unit", "type"],
      formatter: (data: any) => {
        const formattedDate = dayjs(data.date).format("DD.MM.YYYY HH:mm");
        return {
          title: formattedDate,
          name: data.source,
          value: `${data.value.toFixed(2)} ${data.measurement_unit}`,
        };
      },
    },
    color: (datum: any) => {
      return datum.type === "reading" ? "#ff4d4f" : "#1890ff";
    },
  };

  const [view, setView] = useState<"chart" | "table">("chart");

  const isLoadingOrRefetching = isLoadingModels || isLoadingForecasts || isLoadingReadings;

  return (
    <>
      <Row style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Row>
            <Space wrap>
              <div>
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                  {t("Select Models")}:
                </Title>
                <Select
                  mode="multiple"
                  placeholder={t("Select models")}
                  style={{ minWidth: 200 }}
                  value={selectedModels}
                  onChange={setSelectedModels}
                  loading={isLoadingModels}
                >
                  {modelsData?.data?.map((model) => (
                    <Option key={model.id} value={model.id}>
                      {model.name}
                    </Option>
                  ))}
                </Select>
              </div>
              
              <div>
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                  {t("Select Time of Forecasts")}:
                </Title>
                <Select
                  mode="multiple"
                  placeholder={t("Select TOFs")}
                  style={{ minWidth: 250 }}
                  value={selectedTofs}
                  onChange={setSelectedTofs}
                  disabled={!selectedModels.length}
                >
                  {allAvailableTofs.map((tof) => (
                    <Option key={tof} value={tof}>
                      {dayjs(tof).format("DD.MM.YYYY HH:mm")}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                  {t("Show Readings")}:
                </Title>
                <Switch
                  checked={showReadings}
                  onChange={setShowReadings}
                  disabled={!allForecastData.length}
                />
              </div>
            </Space>
          </Row>

          <Row>
            <Segmented
              options={[
                { label: t("Chart"), value: "chart", icon: <LineChartOutlined /> },
                {
                  label: t("Table"),
                  value: "table",
                  icon: <UnorderedListOutlined />,
                },
              ]}
              value={view}
              onChange={setView}
            />
          </Row>
        </Space>
      </Row>

      <Divider style={{ margin: "13px 0" }} />
      
      <Row>
        {view === "chart" ? (
          <Line
            {...chartProps}
            style={{ width: "100%", height: "440px" }}
            loading={isLoadingOrRefetching}
          />
        ) : (
          <>
            <Flex
              align="center"
              justify="space-between"
              style={{ width: "100%", marginBottom: "15px" }}
            >
              <CheckboxGroup
                options={availableSources}
                value={checkedList}
                onChange={setCheckedList}
              />
              <Button
                onClick={() => exportToCSV(filteredData || [])}
                style={{ marginLeft: "auto" }}
                disabled={filteredData?.length === 0}
                icon={<ExportOutlined />}
              >
                {t("Export CSV")}
              </Button>
            </Flex>

            <Table
              dataSource={filteredData}
              columns={generateTableColumns(checkedList)}
              pagination={{ position: [bottom] }}
              style={{ width: "100%", height: "100%" }}
              size={"middle"}
              loading={isLoadingOrRefetching}
            />
          </>
        )}
      </Row>
    </>
  );
}; 