import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShow, useTranslate, useApiUrl, useCustom } from "@refinedev/core";
import { Breadcrumb, List, ListButton } from "@refinedev/antd";
import { useAuth0 } from "@auth0/auth0-react";
import { 
  Button, 
  Col, 
  Flex, 
  Row, 
  Skeleton, 
  Typography, 
  Upload, 
  Card,
  Tag,
  Table,
  Alert,
  Space,
  Divider,
  Progress,
  message
} from "antd";
import { 
  LeftOutlined, 
  UploadOutlined, 
  InboxOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { CardWithContent } from "../../components";
import type { Model } from "../../interfaces";
import { Line } from "@ant-design/plots";
import dayjs from "dayjs";

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;

interface PlaygroundFeatures {
  model_id: number;
  model_name: string;
  features: string[];
  plant_id: number;
  plant_name: string;
}

interface PlaygroundPrediction {
  timestamp: string;
  prediction: number;
}

interface PlaygroundMetric {
  metric_type: string;
  value: number;
}

interface PlaygroundResponse {
  model_id: number;
  predictions: PlaygroundPrediction[];
  metrics: PlaygroundMetric[];
  input_rows: number;
  success: boolean;
  message: string;
  validation_errors?: string[];
}

export const ModelPlayground = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = useApiUrl();
  const { getAccessTokenSilently } = useAuth0();

  // State management
  const [features, setFeatures] = useState<PlaygroundFeatures | null>(null);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<PlaygroundResponse | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Fetch model details for context
  const { query: queryResult } = useShow<Model>({
    resource: "models",
    id: id!,
  });
  const { data: modelData, isLoading: isModelLoading } = queryResult;
  const model = modelData?.data;

  // Fetch model features on component mount
  const { 
    refetch: fetchFeatures,
    isFetching: isFetchingFeatures 
  } = useCustom({
    url: `${API_URL}/playground/model/${id}/features`,
    method: "get",
    queryOptions: {
      enabled: false,
    },
  });

  // Load features when component mounts
  useEffect(() => {
    if (id) {
      console.log("Loading features for model ID:", id);
      setLoadingFeatures(true);
      fetchFeatures()
        .then((response) => {
          console.log("Features API response:", response);
          // The response is wrapped in a Refine response object, get the actual data
          const featuresData = (response?.data?.data || response?.data) as unknown as PlaygroundFeatures;
          console.log("Extracted features data:", featuresData);
          if (featuresData && featuresData.features && Array.isArray(featuresData.features)) {
            console.log("Features loaded successfully:", featuresData);
            setFeatures(featuresData);
          } else {
            console.error("Invalid features data structure:", featuresData);
            message.error(t("models.playground.failedToLoadFeatures"));
          }
          setLoadingFeatures(false);
        })
        .catch((error) => {
          console.error("Failed to fetch features:", error);
          message.error(t("models.playground.failedToLoadFeatures"));
          setLoadingFeatures(false);
        });
    }
  }, [id, fetchFeatures, t]);

  const handleBack = () => {
    navigate(`/models/show/${id}`);
  };

  const beforeUpload = (file: any) => {
    const isCSV = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
    if (!isCSV) {
      message.error(t("models.playground.invalidFileType"));
      return false;
    }
    
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error(t("models.playground.fileTooLarge"));
      return false;
    }
    
    return false; // Prevent auto upload
  };

  const handleFileChange = (info: any) => {
    setFileList(info.fileList.slice(-1));
    setResults(null);
    setErrors([]);
  };

  const handleRunPrediction = async () => {
    if (fileList.length === 0) {
      message.error(t("models.playground.noFileSelected"));
      return;
    }

    setUploading(true);
    setErrors([]);
    setResults(null);

    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("file", fileList[0].originFileObj);

      const response = await fetch(`${API_URL}/playground/predict/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result: PlaygroundResponse = await response.json();
      setResults(result);

      if (result.success) {
        message.success(result.message);
      } else {
        if (result.validation_errors && result.validation_errors.length > 0) {
          setErrors(result.validation_errors);
        }
        message.error(result.message);
      }
    } catch (error: any) {
      console.error("Prediction error:", error);  
      message.error(t("models.playground.predictionFailed"));
    } finally {
      setUploading(false);
    }
  };

  const renderInstructions = () => {
    if (!features || !features.features || !Array.isArray(features.features)) {
      return (
        <Alert
          message={t("models.playground.failedToLoadFeatures")}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      );
    }

    return (
      <CardWithContent 
        title={t("models.playground.csvFormatTitle")}
        bodyStyles={{ padding: "16px" }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Text>
            {t("models.playground.csvFormatDescription")}
          </Text>
          
          <div>
            <Text strong>
              {t("models.playground.csvHeaders")} ({t("models.playground.requiredInOrder")}):
            </Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="blue">timestamp</Tag>
              {features.features.map((feature, index) => (
                <Tag key={index} color="green">{feature}</Tag>
              ))}
            </div>
          </div>

          <Alert
            message={t("models.playground.csvFormatNote")}
            type="info"
            showIcon
          />
        </Space>
      </CardWithContent>
    );
  };

  const renderUploadSection = () => (
    <CardWithContent 
      title={t("models.playground.uploadDataset")}
      bodyStyles={{ padding: "16px" }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Dragger
          accept=".csv"
          beforeUpload={beforeUpload}
          fileList={fileList}
          onChange={handleFileChange}
          multiple={false}
          showUploadList={{ 
            showPreviewIcon: false, 
            showRemoveIcon: true,
            showDownloadIcon: false 
          }}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {t("models.playground.dragUploadText")}
          </p>
          <p className="ant-upload-hint">
            {t("models.playground.uploadHint")}
          </p>
        </Dragger>

        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          size="large"
          onClick={handleRunPrediction}
          loading={uploading}
          disabled={fileList.length === 0}
          style={{ width: "100%" }}
        >
          {uploading ? t("models.playground.processing") : t("models.playground.runPrediction")}
        </Button>
      </Space>
    </CardWithContent>
  );

  const renderResults = () => {
    if (!results) return null;

    const chartData = results.predictions.map(pred => ({
      timestamp: pred.timestamp,
      prediction: pred.prediction,
      date: dayjs(pred.timestamp).format("YYYY-MM-DD HH:mm"),
    }));

    const metricsColumns = [
      {
        title: t("models.playground.metricType"),
        dataIndex: "metric_type",
        key: "metric_type",
        render: (text: string) => <Tag color="blue">{text}</Tag>
      },
      {
        title: t("models.playground.value"),
        dataIndex: "value",
        key: "value",
        render: (value: number) => value.toFixed(4)
      }
    ];

    const predictionsColumns = [
      {
        title: t("models.playground.timestamp"),
        dataIndex: "timestamp",
        key: "timestamp",
        render: (timestamp: string) => dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss")
      },
      {
        title: t("models.playground.prediction"),
        dataIndex: "prediction",
        key: "prediction",
        render: (value: number) => value.toFixed(2)
      }
    ];

    return (
      <CardWithContent 
        title={`${results.success ? "✓" : "✗"} ${t("models.playground.results")}`}
        bodyStyles={{ padding: "16px" }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {/* Summary */}
          <Card size="small" title={t("models.playground.summary")}>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>{t("models.playground.inputRows")}:</Text> {results.input_rows}
              </Col>
              <Col span={8}>
                <Text strong>{t("models.playground.predictions")}:</Text> {results.predictions.length}
              </Col>
              <Col span={8}>
                <Text strong>{t("models.playground.metricsCalculated")}:</Text> {results.metrics.length}
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text>{results.message}</Text>
            </div>
          </Card>

          {/* Metrics */}
          {results.metrics.length > 0 && (
            <Card size="small" title={t("models.playground.metrics")}>
              <Table
                dataSource={results.metrics}
                columns={metricsColumns}
                pagination={false}
                size="small"
                rowKey="metric_type"
              />
            </Card>
          )}

          {/* Chart */}
          {results.predictions.length > 0 && (
            <Card size="small" title={t("models.playground.predictionsChart")}>
              <Line
                data={chartData}
                xField="date"
                yField="prediction"
                height={300}
                smooth
                point={{ size: 3 }}
                xAxis={{
                  label: {
                    autoRotate: true,
                  },
                }}
                yAxis={{
                  label: {
                    formatter: (value: string) => `${value}W`,
                  },
                } as any}
                tooltip={{
                  formatter: (data: any) => ({
                    title: data.date,
                    name: t("models.playground.prediction"),
                    value: `${data.prediction.toFixed(2)}W`,
                  }),
                }}
              />
            </Card>
          )}

          {/* Predictions Table */}
          <Card size="small" title={t("models.playground.predictionsTable")}>
            <Table
              dataSource={results.predictions}
              columns={predictionsColumns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              size="small"
              rowKey="timestamp"
              scroll={{ x: true }}
            />
          </Card>
        </Space>
      </CardWithContent>
    );
  };

  if (isModelLoading || loadingFeatures) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active />
      </div>
    );
  }

  return (
    <>
      <Flex style={{ marginBottom: "10px" }}>
        <ListButton 
          icon={<LeftOutlined />}
          onClick={handleBack}
        >
          {t("models.playground.backToModel")}
        </ListButton>
      </Flex>
      
            <List
        breadcrumb={<Breadcrumb hideIcons showHome={true} />}
        title={
          <Space>
            <FileTextOutlined style={{ color: "#1890ff" }} />
            {t("models.playground.title")}
            {(model?.name || features?.model_name) && (
              <>
                <Divider type="vertical" />
                <Text type="secondary">{model?.name || features?.model_name}</Text>
              </>
            )}
          </Space>
        }
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Model Info */}
            {features && (
              <Alert
                message={
                  <Space>
                    <Text strong>{t("models.playground.modelInfo")}:</Text>
                    <Text>{features.model_name}</Text>
                    <Divider type="vertical" />
                    <Text strong>{t("models.playground.plant")}:</Text>
                    <Text>{features.plant_name}</Text>
                  </Space>
                }
                type="info"
                showIcon
              />
            )}

            {/* Validation Errors */}
            {errors.length > 0 && (
              <Alert
                message={t("models.playground.validationErrors")}
                description={
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                }
                type="error"
                showIcon
                closable
                onClose={() => setErrors([])}
              />
            )}

            {/* Step 1: Instructions */}
            {loadingFeatures ? (
              <Card title={t("models.playground.csvFormatTitle")} style={{ marginBottom: 24 }}>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            ) : (
              renderInstructions()
            )}

            {/* Step 2: Upload */}
            {renderUploadSection()}

            {/* Step 3: Results */}
            {results && renderResults()}
          </Space>
        </div>
      </List>
    </>
  );
}; 