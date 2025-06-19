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
} from "antd";
import { Line } from "@ant-design/plots";
import dayjs from "dayjs";
import { Model } from "../../../interfaces";

const { Title } = Typography;
const { Option } = Select;

// Clean interfaces
interface ForecastPoint {
  id: number;
  prediction_time: string;
  power_output: number;
}

interface ChartData {
  date: string;
  value: number;
  series: string;
  isPreview: boolean;
  color: string;
}

interface CommittedForecast {
  id: string; // unique identifier
  modelId: number;
  modelName: string;
  tof: string;
  data: ChartData[];
  color: string;
}

export const PlantTofForecasts = () => {
  const t = useTranslate();
  const { id: plantId } = useParsed();
  const API_URL = useApiUrl();

  // Clean state structure
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedTof, setSelectedTof] = useState<string | null>(null);
  const [availableTofs, setAvailableTofs] = useState<string[]>([]);
  const [isLoadingTofs, setIsLoadingTofs] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ChartData[]>([]);
  const [committedForecasts, setCommittedForecasts] = useState<CommittedForecast[]>([]);

  // Get all models for this plant
  const { data: modelsData, isLoading: isLoadingModels } = useCustom<Model[]>({
    url: `${API_URL}/power_plant/${plantId}/models`,
    method: "get",
    queryOptions: {
      enabled: !!plantId,
    },
  });

  // Generate random color for new forecasts
  const generateColor = () => {
    const colors = [
      "#1890ff", "#52c41a", "#faad14", "#722ed1", "#eb2f96",
      "#13c2c2", "#fa8c16", "#a0d911", "#2f54eb", "#f759ab",
      "#ff7875", "#36cfc9", "#ffec3d", "#b37feb", "#ff9c6e",
      "#5cdbd3", "#ffd666", "#d3adf7", "#87d068", "#ffc069"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle model selection
  const handleModelSelect = async (modelId: number) => {
    setSelectedModel(modelId);
    setSelectedTof(null);
    setPreviewData([]);
    
    setIsLoadingTofs(true);
    try {
      const response = await fetch(`${API_URL}/forecast/${modelId}/timestamps`);
      if (!response.ok) {
        throw new Error('Failed to fetch TOFs');
      }
      const tofs: string[] = await response.json();
      setAvailableTofs(tofs.sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()));
    } catch (error) {
      console.error('Error fetching TOFs:', error);
      message.error(t('Failed to load TOFs'));
      setAvailableTofs([]);
    } finally {
      setIsLoadingTofs(false);
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
        color: "#ff4d4f" // Red for preview
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

    const color = generateColor();
    const seriesName = `${model.name} (${dayjs(selectedTof).format("DD.MM.YYYY HH:mm")})`;
    
    const newForecast: CommittedForecast = {
      id: `${selectedModel}-${selectedTof}`,
      modelId: selectedModel,
      modelName: model.name,
      tof: selectedTof,
      color: color,
      data: previewData.map(point => ({
        ...point,
        isPreview: false,
        color: color
      }))
    };

    setCommittedForecasts(prev => [...prev, newForecast]);
    
    // Clear building state
    setSelectedModel(null);
    setSelectedTof(null);
    setAvailableTofs([]);
    setPreviewData([]);
    
    message.success(t('Forecast combination added'));
  };

  // Remove committed forecast
  const handleRemoveForecast = (forecastId: string) => {
    setCommittedForecasts(prev => prev.filter(f => f.id !== forecastId));
    message.info(t('Forecast combination removed'));
  };

  // Prepare chart data
  const chartData = [
    ...committedForecasts.flatMap(forecast => forecast.data),
    ...previewData
  ];

  const chartProps = {
    data: chartData,
    xField: "date",
    yField: "value",
    seriesField: "series",
    xAxis: {
      label: {
        formatter: (v: string) => dayjs(v).format("DD.MM. HH:mm"),
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v} W`,
      },
    },
    lineStyle: (datum: any) => ({
      lineWidth: datum.isPreview ? 3 : 2,
      lineDash: datum.isPreview ? [5, 5] : undefined,
    }),
    color: (datum: any) => datum.color,
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

          <Col span={6}>
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
              {t("Time of Forecast")}:
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
                color={forecast.color}
              >
                {forecast.modelName} @ {dayjs(forecast.tof).format("DD.MM.YYYY HH:mm")}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* Chart */}
      <Card>
        <Line
          {...chartProps}
          style={{ width: "100%", height: "440px" }}
          loading={isLoadingPreview && previewData.length === 0}
        />
      </Card>
    </Space>
  );
};