import React, { useState } from "react";
import { Modal, Upload, Alert, Typography, Space, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslate, useApiUrl } from "@refinedev/core";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const { Text, Paragraph } = Typography;

interface PlantReadingsUploadModalProps {
  visible: boolean;
  onClose: () => void;
  plantId?: string | number;
}

interface CSVUploadResponse {
  success: boolean;
  message: string;
  validation_errors?: string[];
}

export const PlantReadingsUploadModal: React.FC<PlantReadingsUploadModalProps> = ({
  visible,
  onClose,
  plantId,
}) => {
  const t = useTranslate();
  const API_URL = useApiUrl();
  const { getAccessTokenSilently } = useAuth0();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (): boolean => {
    if (fileList.length === 0) {
      message.error(t("plants.uploadReadings.fileTypeError"));
      return false;
    }

    const file = fileList[0];
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      message.error(t("plants.uploadReadings.fileTypeError"));
      return false;
    }

    return true;
  };

  const handleUploadSuccess = () => {
    message.success(t("notifications.uploadSuccess", {
      resource: t("plants.readings"),
    }));
    setFileList([]);
    onClose();
  };

  const handleUploadFailure = (response: CSVUploadResponse) => {
    const responseErrors = response.validation_errors || [];
    if (responseErrors.length > 0) {
      setErrors(responseErrors);
    } else {
      message.error(response.message || t("notifications.uploadError", {
        resource: t("plants.readings"),
        statusCode: 200,
      }));
    }
  };

  const handleUploadError = (error: any) => {
    console.error("Upload error:", error);
    const errorMessage = error.message || t("notifications.uploadError", {
      resource: t("plants.readings"),
      statusCode: error.response?.status || "network",
    });
    message.error(errorMessage);
  };

  const uploadFile = async (): Promise<CSVUploadResponse> => {
    const token = await getAccessTokenSilently();
    const formData = new FormData();
    formData.append("file", fileList[0].originFileObj);

    const response = await axios.post<CSVUploadResponse>(
      `${API_URL}/reading/${plantId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };

  const handleUpload = async () => {
    if (!validateFile()) {
      return;
    }

    setUploading(true);
    setErrors([]);

    try {
      const result = await uploadFile();
      
      if (result.success) {
        handleUploadSuccess();
      } else {
        handleUploadFailure(result);
      }
    } catch (error: any) {
      handleUploadError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFileList([]);
    setErrors([]);
    onClose();
  };

  const beforeUpload = (file: any) => {
    const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");
    if (!isCSV) {
      message.error(t("plants.uploadReadings.fileTypeError"));
      return false;
    }
    return false;
  };

  const handleFileChange = (info: any) => {
    setFileList(info.fileList.slice(-1));
  };

  return (
    <Modal
      title={t("plants.uploadReadings.modalTitle")}
      open={visible}
      onOk={handleUpload}
      onCancel={handleCancel}
      okText={t("common.upload")}
      cancelText={t("common.cancel")}
      confirmLoading={uploading}
      width={600}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Paragraph>{t("plants.uploadReadings.description")}</Paragraph>
          
          <Alert
            message={t("plants.uploadReadings.formatTitle")}
            description={
              <Space direction="vertical" size="small">
                <Text>{t("plants.uploadReadings.formatDescription")}</Text>
                <Text strong>{t("plants.uploadReadings.formatExample")}</Text>
                <Text code>2024-01-15T10:30:00Z,1234.56</Text>
                <Text code>2024-01-15T10:31:00Z,1235.78</Text>
                <Text code>2024-01-15T10:32:00Z,1236.90</Text>
                
                <Space direction="vertical" size="small" style={{ marginTop: 8 }}>
                  <Text>• {t("plants.uploadReadings.formatFields.timestamp")}</Text>
                  <Text>• {t("plants.uploadReadings.formatFields.power")}</Text>
                </Space>
                
                <Alert
                  message={t("plants.uploadReadings.noHeader")}
                  type="warning"
                  showIcon
                  style={{ marginTop: 8 }}
                />
              </Space>
            }
            type="info"
            showIcon
          />
        </div>

        {errors.length > 0 && (
          <Alert
            message={t("common.validationErrors")}
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            }
            type="error"
            showIcon
          />
        )}

        <Upload.Dragger
          accept=".csv"
          beforeUpload={beforeUpload}
          fileList={fileList}
          onChange={handleFileChange}
          multiple={false}
          showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            {t("plants.uploadReadings.dragText")}
          </p>
        </Upload.Dragger>
      </Space>
    </Modal>
  );
}; 