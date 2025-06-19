import { useState, useEffect, useMemo } from "react";
import { useApiUrl, useCustom, useParsed, useTranslate } from "@refinedev/core";
import {
  Button,
  Row,
  Col,
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
  modelId?: number;
  tof?: string;
}

const CheckboxGroup = Checkbox.Group;
const { Title } = Typography;
const { Option, OptGroup } = Select;

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
  const [selectedCombinations, setSelectedCombinations] = useState<Array<{modelId: number, tof: string}>>([]);
  const [availableTofs, setAvailableTofs] = useState<{ [modelId: number]: string[] }>({});
  const [loadingTofs, setLoadingTofs] = useState(false);
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

  // Fetch available TOFs for all models
  const fetchAvailableTofs = async () => {
    if (!modelsData?.data?.length) {
      setAvailableTofs({});
      return;
    }

    setLoadingTofs(true);
    try {
      const tofPromises = modelsData.data.map(async (model) => {
        try {
          const response = await fetch(`${API_URL}/forecast/${model.id}/timestamps`);
          if (!response.ok) {
            console.warn(`Failed to fetch TOFs for model ${model.id}`);
            return { modelId: model.id, tofs: [] };
          }
          const tofs: string[] = await response.json();
          return { modelId: model.id, tofs };
        } catch (error) {
          console.warn(`Error fetching TOFs for model ${model.id}:`, error);
          return { modelId: model.id, tofs: [] };
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
    } finally {
      setLoadingTofs(false);
    }
  };

  // Fetch forecasts for selected combinations
  const fetchTofForecasts = async () => {
    if (!selectedCombinations.length) {
      setAllForecastData([]);
      return;
    }

    setIsLoadingForecasts(true);
    try {
      const forecastPromises: Promise<IChartData[]>[] = selectedCombinations.map(async ({ modelId, tof }) => {
        const model = modelsData?.data?.find(m => m.id === modelId);
        if (!model) return [];

        try {
          const response = await fetch(`${API_URL}/forecast/time_of_forecast/${modelId}?tof=${encodeURIComponent(tof)}`);
          if (!response.ok) {
            console.warn(`Failed to fetch forecast for model ${model.name} TOF ${tof}`);
            return [];
          }
          const data: IForecastData[] = await response.json();
          return data.map(item => ({
            date: item.prediction_time,
            value: item.power_output,
            source: `${model.name} (${dayjs(tof).format("DD.MM.YYYY HH:mm")})`,
            measurement_unit: "W",
            type: "forecast" as const,
            modelId: modelId,
            tof: tof,
          }));
        } catch (error) {
          console.warn(`Error fetching forecast for model ${model.name} TOF ${tof}:`, error);
          return [];
        }
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

  // Effects with proper dependencies to prevent flickering
  useEffect(() => {
    fetchAvailableTofs();
  }, [modelsData?.data?.length]); // Only re-run when models data changes

  useEffect(() => {
    fetchTofForecasts();
  }, [JSON.stringify(selectedCombinations)]); // Re-run when combinations actually change

  useEffect(() => {
    fetchReadings();
  }, [showReadings, allForecastData.length]); // Only re-run when toggle changes or data length changes

  // Get all available combinations
  const availableCombinations = useMemo(() => {
    const combinations: Array<{
      modelId: number;
      modelName: string;
      tof: string;
      isSelected: boolean;
    }> = [];

    modelsData?.data?.forEach(model => {
      const modelTofs = availableTofs[model.id] || [];
      modelTofs.forEach(tof => {
        combinations.push({
          modelId: model.id,
          modelName: model.name,
          tof,
          isSelected: selectedCombinations.some(
            combo => combo.modelId === model.id && combo.tof === tof
          ),
        });
      });
    });

    return combinations.sort((a, b) => {
      // Sort by model name first, then by TOF date (newest first)
      if (a.modelName !== b.modelName) {
        return a.modelName.localeCompare(b.modelName);
      }
      return dayjs(b.tof).valueOf() - dayjs(a.tof).valueOf();
    });
  }, [modelsData, availableTofs, selectedCombinations]);

  const [checkedList, setCheckedList] = useState<string[]>([]);

  // Get available sources from forecast and readings data - memoize to prevent flickering
  const combinedData = useMemo(() => [...allForecastData, ...readingsData], [allForecastData, readingsData]);
  const availableSources = useMemo(() => [...new Set(combinedData.map((item) => item.source))], [combinedData]);

  useEffect(() => {
    if (combinedData.length > 0) {
      setCheckedList(availableSources);
    }
  }, [availableSources.join(',')]);

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

  // Generate random colors for each combination
  const [combinationColors, setCombinationColors] = useState<{[key: string]: string}>({});
  
  const generateRandomColor = () => {
    const colors = [
      "#1890ff", "#52c41a", "#faad14", "#722ed1", "#eb2f96", 
      "#13c2c2", "#fa8c16", "#a0d911", "#2f54eb", "#f759ab",
      "#ff7875", "#36cfc9", "#ffec3d", "#b37feb", "#ff9c6e",
      "#5cdbd3", "#ffd666", "#d3adf7", "#87d068", "#ffc069"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Assign colors to combinations when they change
  useEffect(() => {
    const newColors: {[key: string]: string} = {};
    selectedCombinations.forEach(combo => {
      const key = `${combo.modelId}-${combo.tof}`;
      const model = modelsData?.data?.find(m => m.id === combo.modelId);
      if (model) {
        const sourceName = `${model.name} (${dayjs(combo.tof).format("DD.MM.YYYY HH:mm")})`;
        if (!combinationColors[sourceName]) {
          newColors[sourceName] = generateRandomColor();
        } else {
          newColors[sourceName] = combinationColors[sourceName];
        }
      }
    });
    
    // Add color for readings if enabled
    if (showReadings && readingsData.length > 0) {
      newColors["Actual Readings"] = "#ff4d4f";
    }
    
    setCombinationColors(newColors);
  }, [selectedCombinations, showReadings, readingsData.length, modelsData]);

  // Prepare chart data - ensure each combination is completely separate
  const chartData = useMemo(() => {
    const filtered = combinedData.filter(item => checkedList.includes(item.source));
    
    // Add a unique series identifier to prevent line merging
    return filtered.map(item => ({
      ...item,
      seriesId: `${item.source}_${item.type}`, // Unique series identifier
    }));
  }, [combinedData, checkedList]);
  
  const chartProps = {
    data: chartData,
    xField: "date",
    yField: "value", 
    seriesField: "seriesId", // Use unique series ID instead of just source
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
    legend: {
      itemName: {
        formatter: (text: string) => {
          // Remove the unique suffix for display
          const sourceName = text.replace(/_forecast$|_reading$/, '');
          return sourceName;
        }
      }
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
    lineStyle: {
      lineWidth: 2,
    },
    point: {
      size: 3,
    },
    connectNulls: false,
    color: (datum: any) => {
      const sourceName = datum.source;
      return combinationColors[sourceName] || "#1890ff";
    },
  };

  const [view, setView] = useState<"chart" | "table">("chart");

  const isLoadingOrRefetching = isLoadingModels || isLoadingForecasts || isLoadingReadings;

  return (
    <>
            <Row style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                {t("Select Forecast Combinations")}:
              </Title>
              <div style={{ 
                border: "1px solid #d9d9d9", 
                borderRadius: "6px", 
                maxHeight: "300px", 
                overflowY: "auto",
                backgroundColor: "#fafafa"
              }}>
                {loadingTofs ? (
                  <div style={{ padding: 16, textAlign: "center" }}>
                    Loading available combinations...
                  </div>
                ) : availableCombinations.length === 0 ? (
                  <div style={{ padding: 16, textAlign: "center", color: "#999" }}>
                    No combinations available. Please check if models have forecasts.
                  </div>
                ) : (
                  availableCombinations.map((combo, index) => (
                    <div
                      key={`${combo.modelId}-${combo.tof}`}
                      style={{
                        padding: "8px 12px",
                        borderBottom: index < availableCombinations.length - 1 ? "1px solid #f0f0f0" : "none",
                        backgroundColor: combo.isSelected ? "#e6f7ff" : "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onClick={() => {
                        const isCurrentlySelected = combo.isSelected;
                        if (isCurrentlySelected) {
                          setSelectedCombinations(prev => 
                            prev.filter(c => !(c.modelId === combo.modelId && c.tof === combo.tof))
                          );
                        } else {
                          setSelectedCombinations(prev => 
                            [...prev, { modelId: combo.modelId, tof: combo.tof }]
                          );
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Checkbox checked={combo.isSelected} />
                        <strong>{combo.modelName}</strong>
                        <span style={{ color: "#666" }}>@</span>
                        <span>{dayjs(combo.tof).format("DD.MM.YYYY HH:mm")}</span>
                      </div>
                      {combo.isSelected && (
                        <Button
                          type="text"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCombinations(prev => 
                              prev.filter(c => !(c.modelId === combo.modelId && c.tof === combo.tof))
                            );
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div style={{ marginTop: 8, display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Button
                  size="small"
                  onClick={() => setSelectedCombinations([])}
                  disabled={selectedCombinations.length === 0}
                >
                  Clear All
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    const allCombinations = availableCombinations.map(combo => ({
                      modelId: combo.modelId,
                      tof: combo.tof
                    }));
                    setSelectedCombinations(allCombinations);
                  }}
                  disabled={availableCombinations.length === 0}
                >
                  Select All
                </Button>
                {selectedCombinations.length > 0 && (
                  <span style={{ fontSize: "12px", color: "#666", alignSelf: "center" }}>
                    {selectedCombinations.length} combination{selectedCombinations.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
            </Col>

            <Col span={8}>
              <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                {t("Show Readings")}:
              </Title>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Switch
                  checked={showReadings}
                  onChange={setShowReadings}
                  disabled={!allForecastData.length}
                />
                <span style={{ fontSize: "14px" }}>
                  {showReadings ? "Enabled" : "Disabled"}
                </span>
              </div>
              {showReadings && readingsData.length > 0 && (
                <div style={{ marginTop: 4, fontSize: "12px", color: "#666" }}>
                  {readingsData.length} readings loaded
                </div>
              )}
            </Col>
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
            key={`chart-${selectedCombinations.length}-${checkedList.join(',')}`}
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