import { useState, useEffect } from "react";
import { useApiUrl, useCustom, useParsed, useTranslate } from "@refinedev/core";
import {
  Button,
  Row,
  Col,
  Typography,
  Select,
  Card,
  Space,
  Tag,
  message,
  DatePicker,
  Checkbox,
  Segmented,
  Table,
} from "antd";
import {
  ExportOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Line } from "@ant-design/plots";
import dayjs from "dayjs";
import { Model } from "../../../interfaces";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

type TableDataType = {
  key: string;
  date: string;
  formattedDate: string;
  [key: string]: any; // Dynamic columns for each series
};

// CSV Export utility function
const exportToCSV = (data: ChartData[], filename: string = "tof_forecast_data.csv") => {
  if (data.length === 0) {
    return;
  }

  // Group data by series for better CSV structure
  const seriesGroups = data.reduce((acc, point) => {
    if (!acc[point.series]) {
      acc[point.series] = [];
    }
    acc[point.series].push(point);
    return acc;
  }, {} as Record<string, ChartData[]>);

  // Create headers: Date + all series names
  const seriesNames = Object.keys(seriesGroups);
  const headers = ["Date", ...seriesNames];

  // Get all unique dates and sort them
  const allDates = [...new Set(data.map(point => point.date))].sort(
    (a, b) => dayjs(a).valueOf() - dayjs(b).valueOf()
  );

  // Create CSV rows
  const csvRows = [headers.join(",")];
  
  allDates.forEach(date => {
    const row = [dayjs(date).format("DD.MM.YYYY HH:mm")];
    
    seriesNames.forEach(seriesName => {
      const point = seriesGroups[seriesName].find(p => p.date === date);
      row.push(point ? point.value.toFixed(2) : "");
    });
    
    csvRows.push(row.join(","));
  });

  // Create and download CSV
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate table columns dynamically based on available series
const generateTableColumns = (seriesNames: string[], t: any) => {
  const columns: any[] = [
    {
      title: t("chart.date"),
      dataIndex: "formattedDate",
      key: "formattedDate",
      width: 150,
      sorter: (a: TableDataType, b: TableDataType) => 
        dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      defaultSortOrder: 'ascend' as const,
    },
  ];

  seriesNames.forEach((seriesName) => {
    columns.push({
      title: seriesName,
      dataIndex: seriesName,
      key: seriesName,
      width: 120,
      render: (value: number | undefined) => 
        value !== undefined ? `${value.toFixed(2)} W` : '-',
    });
  });

  return columns;
};

const prepareTableData = (chartData: ChartData[]): { data: TableDataType[], seriesNames: string[] } => {
  if (chartData.length === 0) {
    return { data: [], seriesNames: [] };
  }

  // Group data by series
  const seriesGroups = chartData.reduce((acc, point) => {
    if (!acc[point.series]) {
      acc[point.series] = [];
    }
    acc[point.series].push(point);
    return acc;
  }, {} as Record<string, ChartData[]>);

  const seriesNames = Object.keys(seriesGroups);

  // Get all unique dates and sort them
  const allDates = [...new Set(chartData.map(point => point.date))].sort(
    (a, b) => dayjs(a).valueOf() - dayjs(b).valueOf()
  );

  // Create table rows
  const tableData: TableDataType[] = allDates.map(date => {
    const row: TableDataType = {
      key: date,
      date: date,
      formattedDate: dayjs(date).format("DD.MM.YYYY HH:mm"),
    };

    seriesNames.forEach(seriesName => {
      const point = seriesGroups[seriesName].find(p => p.date === date);
      row[seriesName] = point?.value;
    });

    return row;
  });

  return { data: tableData, seriesNames };
};

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

interface ChartData {
  date: string;
  value: number;
  series: string;
  isPreview: boolean;
}

interface CommittedForecast {
  id: string;
  modelId: number;
  modelName: string;
  tof: string;
  data: ChartData[];
}

export const PlantTofForecasts = () => {
  const t = useTranslate();
  const { id: plantId } = useParsed();
  const API_URL = useApiUrl();

  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedTof, setSelectedTof] = useState<string | null>(null);
  const [availableTofs, setAvailableTofs] = useState<string[]>([]);
  const [allTofs, setAllTofs] = useState<string[]>([]); // Store all TOFs before filtering
  const [tofDateRange, setTofDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [isLoadingTofs, setIsLoadingTofs] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ChartData[]>([]);
  const [committedForecasts, setCommittedForecasts] = useState<CommittedForecast[]>([]);
  
  // Readings state
  const [showReadings, setShowReadings] = useState(false);
  const [readingsData, setReadingsData] = useState<ChartData[]>([]);
  const [isLoadingReadings, setIsLoadingReadings] = useState(false);
  
  // View state
  const [view, setView] = useState<"chart" | "table">("chart");
  
  // Table pagination state
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: modelsData, isLoading: isLoadingModels } = useCustom<Model[]>({
    url: `${API_URL}/power_plant/${plantId}/models`,
    method: "get",
    queryOptions: {
      enabled: !!plantId,
    },
  });

  const handleModelSelect = async (modelId: number) => {
    setSelectedModel(modelId);
    setSelectedTof(null);
    setPreviewData([]);
    setTofDateRange(null); // Reset date filter when changing models
    
    setIsLoadingTofs(true);
    try {
      const response = await fetch(`${API_URL}/forecast/${modelId}/timestamps`);
      if (!response.ok) {
        throw new Error('Failed to fetch TOFs');
      }
      const tofs: string[] = await response.json();
      const sortedTofs = tofs.sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf());
      setAllTofs(sortedTofs);
      setAvailableTofs(sortedTofs); // Initially show all TOFs
    } catch (error) {
      console.error('Error fetching TOFs:', error);
      message.error(t('tofForecasts.failedToLoadTofs'));
      setAllTofs([]);
      setAvailableTofs([]);
    } finally {
      setIsLoadingTofs(false);
    }
  };

  const handleTofDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setTofDateRange(dates);
    setSelectedTof(null); // Clear selected TOF as it might be filtered out
    setPreviewData([]);

    if (!dates || !dates[0] || !dates[1]) {
      // No date filter, show all TOFs
      setAvailableTofs(allTofs);
    } else {
      // Filter TOFs by date range
      const [startDate, endDate] = dates;
      const filtered = allTofs.filter(tof => {
        const tofDate = dayjs(tof);
        return tofDate.isAfter(startDate.startOf('day')) && tofDate.isBefore(endDate.endOf('day'));
      });
      setAvailableTofs(filtered);
    }
  };

  const handleTofSelect = async (tof: string) => {
    if (!selectedModel) return;
    
    setSelectedTof(tof);
    setIsLoadingPreview(true);
    
    try {
      const response = await fetch(`${API_URL}/forecast/time_of_forecast/${selectedModel}?tof=${encodeURIComponent(tof)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const data: ForecastPoint[] = await response.json();
      const model = modelsData?.data?.find(m => m.id === selectedModel);
      const seriesName = `${model?.name} (${dayjs(tof).format("DD.MM.YYYY HH:mm")})`;
      
      const chartData: ChartData[] = data.map(point => ({
        date: point.prediction_time,
        value: point.power_output,
        series: seriesName,
        isPreview: true,
      }));
      
      setPreviewData(chartData);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      message.error(t('tofForecasts.failedToLoadForecastData'));
      setPreviewData([]);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleAddCombination = () => {
    if (!selectedModel || !selectedTof || previewData.length === 0) return;
    
    const model = modelsData?.data?.find(m => m.id === selectedModel);
    if (!model) return;

    const seriesName = `${model.name} (${dayjs(selectedTof).format("DD.MM.YYYY HH:mm")})`;
    
    const newForecast: CommittedForecast = {
      id: `${selectedModel}-${selectedTof}`,
      modelId: selectedModel,
      modelName: model.name,
      tof: selectedTof,
      data: previewData.map(point => ({
        ...point,
        isPreview: false,
      }))
    };

    setCommittedForecasts(prev => [...prev, newForecast]);
    
    // Clear building state
    setSelectedModel(null);
    setSelectedTof(null);
    setAvailableTofs([]);
    setAllTofs([]);
    setTofDateRange(null);
    setPreviewData([]);
    
    message.success(t('tofForecasts.forecastCombinationAdded'));
  };

  const handleRemoveForecast = (forecastId: string) => {
    setCommittedForecasts(prev => prev.filter(f => f.id !== forecastId));
    message.info(t('tofForecasts.forecastCombinationRemoved'));
  };

  const getReadingsDateRange = () => {
    if (committedForecasts.length === 0) return null;
    
    const allDates = committedForecasts.flatMap(forecast => 
      forecast.data.map(point => dayjs(point.date))
    );
    
    if (allDates.length === 0) return null;
    
    const earliestDate = allDates.reduce((earliest, current) => 
      current.isBefore(earliest) ? current : earliest
    );
    const latestDate = allDates.reduce((latest, current) => 
      current.isAfter(latest) ? current : latest
    );
    
    return {
      start_date: earliestDate.format("YYYY-MM-DDTHH:mm:ss") + "Z",
      end_date: latestDate.format("YYYY-MM-DDTHH:mm:ss") + "Z"
    };
  };

  const fetchReadings = async () => {
    const dateRange = getReadingsDateRange();
    if (!dateRange || !plantId) return;
    
    setIsLoadingReadings(true);
    try {
      const queryParams = new URLSearchParams(dateRange);
      const response = await fetch(`${API_URL}/reading/${plantId}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch readings');
      }
      
      const data: ReadingPoint[] = await response.json();
          const chartData: ChartData[] = data.map(point => ({
      date: point.timestamp,
      value: point.power_w,
      series: t("plants.readingsCapitalized"),
      isPreview: false,
    }));
      
      setReadingsData(chartData);
    } catch (error) {
      console.error('Error fetching readings:', error);
      message.error(t('tofForecasts.failedToLoadReadings'));
      setReadingsData([]);
    } finally {
      setIsLoadingReadings(false);
    }
  };

  const handleReadingsToggle = (checked: boolean) => {
    setShowReadings(checked);
    if (checked && committedForecasts.length > 0) {
      fetchReadings();
    } else {
      setReadingsData([]);
    }
  };

  // Refetch readings when committed forecasts change
  useEffect(() => {
    if (showReadings && committedForecasts.length > 0) {
      fetchReadings();
    } else if (committedForecasts.length === 0) {
      setReadingsData([]);
    }
  }, [committedForecasts, showReadings]);

  const handleExportCSV = () => {
    const exportData = [
      ...committedForecasts.flatMap(forecast => forecast.data),
      ...(showReadings ? readingsData : [])
    ];
    
    if (exportData.length === 0) {
      message.warning(t('tofForecasts.noDataToExport'));
      return;
    }
    
    const timestamp = dayjs().format("YYYY-MM-DD_HH-mm");
    const filename = `tof_forecasts_${timestamp}.csv`;
    exportToCSV(exportData, filename);
    message.success(t('tofForecasts.dataExportedSuccessfully'));
  };

  const chartData = [
    ...committedForecasts.flatMap(forecast => 
      // Sort each forecast's data chronologically
      forecast.data.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    ),
    // Sort preview data chronologically
    ...previewData.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()),
    // Include readings if enabled
    ...(showReadings ? readingsData.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()) : [])
  ];

  // Prepare table data (excluding preview data for table view)
  const tableChartData = [
    ...committedForecasts.flatMap(forecast => forecast.data),
    ...(showReadings ? readingsData : [])
  ];
  const { data: tableData, seriesNames } = prepareTableData(tableChartData);
  const tableColumns = generateTableColumns(seriesNames, t);

  const chartProps = {
    data: chartData,
    xField: "date",
    yField: "value",
    seriesField: "series",
    xAxis: {
      type: 'time',
      label: {
        formatter: (v: string) => dayjs(v).format("DD.MM. HH:mm"),
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v} W`,
      },
    },
    lineStyle: (datum: any) => {
      const isPreviewLine = previewData.some(p => p.series === datum.series);
      return {
        lineWidth: isPreviewLine ? 3 : 2,
        lineDash: isPreviewLine ? [5, 5] : undefined,
      };
    },
    tooltip: {
      formatter: (data: any) => ({
        title: dayjs(data.date).format("DD.MM.YYYY HH:mm"),
        name: data.series,
        value: `${data.value.toFixed(2)} W`,
      }),
    },
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      {/* Forecast Builder */}
      <Card title={t("tofForecasts.buildNewCombination")} size="small">
        <Row gutter={[16, 16]} align="middle">
          <Col span={6}>
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
              {t("tofForecasts.model")}:
            </Title>
            <Select
              style={{ width: "100%" }}
              placeholder={t("tofForecasts.selectModel")}
              value={selectedModel}
              onChange={handleModelSelect}
              loading={isLoadingModels}
            >
              {modelsData?.data?.map((model) => (
                <Option key={model.id} value={model.id}>
                  {model.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={8}>
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
              {t("tofForecasts.tofDateRange")} ({t("tofForecasts.optional")}):
            </Title>
            <RangePicker
              style={{ width: "100%" }}
              value={tofDateRange}
              onChange={handleTofDateRangeChange}
              disabled={!selectedModel}
              placeholder={[t("tofForecasts.startDate"), t("tofForecasts.endDate")]}
              showTime={{ format: 'HH:mm' }}
              format="DD.MM.YYYY HH:mm"
            />
          </Col>

          <Col span={6}>
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
              {t("tofForecasts.timeOfForecast")}:
              {selectedModel && (
                <span style={{ fontWeight: 'normal', fontSize: '12px', marginLeft: '8px' }}>
                  ({availableTofs.length} {t("tofForecasts.available")})
                </span>
              )}
            </Title>
            <Select
              style={{ width: "100%" }}
              placeholder={t("tofForecasts.selectTof")}
              value={selectedTof}
              onChange={handleTofSelect}
              loading={isLoadingTofs}
              disabled={!selectedModel}
            >
              {availableTofs.map((tof) => (
                <Option key={tof} value={tof}>
                  {dayjs(tof).format("DD.MM.YYYY HH:mm")}
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={4}>
            <Button
              type="primary"
              onClick={handleAddCombination}
              loading={isLoadingPreview}
              disabled={!selectedModel || !selectedTof || previewData.length === 0}
              style={{ marginTop: 32 }}
            >
              {t("tofForecasts.addToChart")}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* View Switcher */}
      {committedForecasts.length > 0 && (
        <Row justify="center">
          <Segmented
            options={[
              { label: t("common.chart"), value: "chart", icon: <LineChartOutlined /> },
              { label: t("common.table"), value: "table", icon: <UnorderedListOutlined /> },
            ]}
            value={view}
            onChange={setView}
          />
        </Row>
      )}

      {/* Active Combinations */}
      {committedForecasts.length > 0 && (
        <Card title={t("tofForecasts.activeCombinations")} size="small">
          <Space wrap>
            {committedForecasts.map((forecast) => (
              <Tag
                key={forecast.id}
                closable
                onClose={() => handleRemoveForecast(forecast.id)}
              >
                {forecast.modelName} @ {dayjs(forecast.tof).format("DD.MM.YYYY HH:mm")}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* Chart Options */}
      {committedForecasts.length > 0 && (
        <Card title={t("tofForecasts.chartOptions")} size="small">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Checkbox
                  checked={showReadings}
                  onChange={(e) => handleReadingsToggle(e.target.checked)}
                  disabled={isLoadingReadings}
                >
                  {t("tofForecasts.showReadings")} {isLoadingReadings && `(${t("common.loading")}...)`}
                </Checkbox>
                {showReadings && readingsData.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    ({readingsData.length} {t("tofForecasts.readingsLoaded")})
                  </span>
                )}
              </Space>
            </Col>
            <Col>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExportCSV}
                disabled={committedForecasts.length === 0}
              >
                {t("common.exportCsv")}
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* Chart/Table View */}
      <Card>
        {view === "chart" ? (
          <Line
            {...chartProps}
            style={{ width: "100%", height: "440px" }}
            loading={(isLoadingPreview && previewData.length === 0) || isLoadingReadings}
          />
        ) : (
          <Table
            dataSource={tableData}
            columns={tableColumns}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50', '100', '200'],
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} ${t("tofForecasts.of")} ${total} ${t("tofForecasts.items")}`,
              onChange: (page, size) => {
                setCurrentPage(page);
                if (size !== pageSize) {
                  setPageSize(size);
                }
              },
              onShowSizeChange: (current, size) => {
                setPageSize(size);
                setCurrentPage(1); // Reset to first page when changing page size
              },
            }}
            scroll={{ x: true }}
            size="middle"
            loading={isLoadingReadings}
          />
        )}
      </Card>
    </Space>
  );
};