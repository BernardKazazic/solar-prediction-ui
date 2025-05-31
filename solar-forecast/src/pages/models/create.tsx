import {
  Create,
  useForm,
} from "@refinedev/antd";

import { useTranslation } from "react-i18next";
import { useList } from "@refinedev/core";

import {
  Form,
  Input,
  Upload,
  InputNumber,
  Switch,
} from "antd";

import type { Model } from "../../interfaces";
import { InboxOutlined } from "@ant-design/icons";
import { FormTransfer } from "../../components";

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

  const { data: featuresData, isLoading: featuresLoading } = useList({
    resource: "features",
    pagination: { mode: "off" },
  });

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  // Transform features for Transfer component
  const transferData = featuresData?.data?.map((feature: any) => ({
    key: feature.value,
    title: feature.name,
  })) || [];

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
          label={t("models.fields.isActive.label", "Active Status")}
          name="is_active"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
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

        <Form.Item 
          name="features"
          label={t("models.fields.features.label", "Model Features")}
          help={t("models.fields.features.help", "Select the features that your model uses for predictions. Order matters.")}
          rules={[
            {
              required: true,
              message: t("models.fields.features.required", "At least one feature is required"),
            },
          ]}
        >
          <FormTransfer
            dataSource={transferData}
            showSearch
            listStyle={{
              width: 300,
              height: 400,
            }}
            operations={[
              t("buttons.select", "Select"), 
              t("parameterForm.removeButton", "Remove")
            ]}
            titles={[
              t("models.fields.features.availableTitle", "Available Features"), 
              t("models.fields.features.selectedTitle", "Selected Features (in order)")
            ]}
            render={(item: any) => item.title}
            disabled={featuresLoading}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
