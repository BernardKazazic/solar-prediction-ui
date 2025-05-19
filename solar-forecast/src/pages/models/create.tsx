import {
  Breadcrumb,
  Create,
  useForm,
} from "@refinedev/antd";

import { useTranslation } from "react-i18next";

import {
  Form,
  Input,
  Upload,
  Typography,
  Checkbox,
  CheckboxOptionType,
  InputNumber,
  Button,
} from "antd";

import type { Model } from "../../interfaces";
import { InboxOutlined } from "@ant-design/icons";
import { useApiUrl, useCustom } from "@refinedev/core";
const { Dragger } = Upload;

export const ModelCreate: React.FC = () => {
  const { t } = useTranslation();
  const {
    formProps,
    saveButtonProps,
    formLoading,
  } = useForm<Model>({
    resource: "models",
    action: "create",
    redirect: "list",
    successNotification: () => ({
      message: t("notifications.success", "Success"),
      description: t("notifications.createSuccess", {
        resource: t("models.title", "Model"),
      }),
      type: "success",
    }),
  });

  const API_URL = useApiUrl();

  const { data: paramsData } = useCustom({
    url: `${API_URL}/models/weather_params`,
    method: "get",
  });

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={t("models.fields.name.label")}
          name="model_name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={t("models.fields.type.label")}
          name="model_type"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Version"
          name="version"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item
          label={t("models.fields.plant.label")}
          name="plant_id"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={t("models.fields.modelFile.label")}
          name="fileList"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true }]}
        >
          <Dragger
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">{t("Upload model file")}</p>
            <p className="ant-upload-hint">
              {t("Drag and drop the model file here or click to upload")}
            </p>
          </Dragger>
        </Form.Item>

        <Typography.Title level={4}>
          {t("parameterForm.commonParamsTitle")}
        </Typography.Title>
        
        <Form.Item 
          name="parameters"
          rules={[{ required: true }]}
        >
          <Checkbox.Group
            options={paramsData?.data as CheckboxOptionType<any>[]}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
