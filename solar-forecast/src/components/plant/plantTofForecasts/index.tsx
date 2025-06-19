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
} from "antd";
import { Line } from "@ant-design/plots";
import dayjs from "dayjs";
import { Model } from "../../../interfaces";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Clean interfaces
interface ForecastPoint {
  id: number;
  prediction_time: string;
  power_output: number;
}

interface ReadingPoint {
  id: number;
  timestamp: string;
  power_output: number;
}

interface ChartData {
  date: string;
  value: number;
  series: string;
  isPreview: boolean;
}

interface CommittedForecast {
  id: string; // unique identifier
  modelId: number;
  modelName: string;
  tof: string;
  data: ChartData[];
}

export const PlantTofForecasts = () => {
  const t = useTranslate();
  const { id: plantId } = useParsed();
  const API_URL = useApiUrl();

  // Clean state structure
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

  // Get all models for this plant
  const { data: modelsData, isLoading: isLoadingModels } = useCustom<Model[]>({
    url: `${API_URL}/power_plant/${plantId}/models`,
    method: "get",
    queryOptions: {
      enabled: !!plantId,
    },
  });

  // Handle model selection
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
      message.error(t('Failed to load TOFs'));
      setAllTofs([]);
      setAvailableTofs([]);
    } finally {
      setIsLoadingTofs(false);
    }
  };

  // Handle TOF date range filtering
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

  // Handle TOF selection and preview
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
      message.error(t('Failed to load forecast data'));
      setPreviewData([]);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Add combination to committed forecasts
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
    
    message.success(t('Forecast combination added'));
  };

  // Remove committed forecast
  const handleRemoveForecast = (forecastId: string) => {
    setCommittedForecasts(prev => prev.filter(f => f.id !== forecastId));
    message.info(t('Forecast combination removed'));
  };

  // Calculate date range for readings based on all committed forecasts
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

  // Fetch readings data
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
        value: point.power_output,
        series: "Readings",
        isPreview: false,
      }));
      
      setReadingsData(chartData);
    } catch (error) {
      console.error('Error fetching readings:', error);
      message.error(t('Failed to load readings'));
      setReadingsData([]);
    } finally {
      setIsLoadingReadings(false);
    }
  };

  // Handle readings toggle
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

  // Prepare chart data - let the chart handle series separation
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
      <Card title={t("Build New Combination")} size="small">
        <Row gutter={[16, 16]} align="middle">
          <Col span={6}>
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
              {t("Model")}:
            </Title>
            <Select
              style={{ width: "100%" }}
              placeholder={t("Select Model")}
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
              {t("TOF Date Range")} ({t("Optional")}):
            </Title>
            <RangePicker
              style={{ width: "100%" }}
              value={tofDateRange}
              onChange={handleTofDateRangeChange}
              disabled={!selectedModel}
              placeholder={[t("Start Date"), t("End Date")]}
              showTime={{ format: 'HH:mm' }}
              format="DD.MM.YYYY HH:mm"
            />
          </Col>

          <Col span={6}>
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
              {t("Time of Forecast")}:
              {selectedModel && (
                <span style={{ fontWeight: 'normal', fontSize: '12px', marginLeft: '8px' }}>
                  ({availableTofs.length} {t("available")})
                </span>
              )}
            </Title>
            <Select
              style={{ width: "100%" }}
              placeholder={t("Select TOF")}
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
              {t("Add to Chart")}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Active Combinations */}
      {committedForecasts.length > 0 && (
        <Card title={t("Active Combinations")} size="small">
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
        <Card title={t("Chart Options")} size="small">
          <Space>
            <Checkbox
              checked={showReadings}
              onChange={(e) => handleReadingsToggle(e.target.checked)}
              disabled={isLoadingReadings}
            >
              {t("Show Readings")} {isLoadingReadings && "(Loading...)"}
            </Checkbox>
            {showReadings && readingsData.length > 0 && (
              <span style={{ fontSize: '12px', color: '#666' }}>
                ({readingsData.length} {t("readings loaded")})
              </span>
            )}
          </Space>
        </Card>
      )}

      {/* Chart */}
      <Card>
        <Line
          {...chartProps}
          style={{ width: "100%", height: "440px" }}
          loading={(isLoadingPreview && previewData.length === 0) || isLoadingReadings}
        />
      </Card>
    </Space>
  );
};