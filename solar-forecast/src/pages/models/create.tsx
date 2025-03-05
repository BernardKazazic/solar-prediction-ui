import {
  Breadcrumb,
  Create,
  SaveButton,
  useSelect,
  useStepsForm,
} from "@refinedev/antd";

import {
  Form,
  Input,
  Select,
  Button,
  Steps,
  Upload,
  Typography,
  Checkbox,
  CheckboxOptionType,
  Divider,
  Tooltip,
  Switch,
} from "antd";

import type { IModel, IPlant } from "../../interfaces";
import { InboxOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useApiUrl, useCustom, useTranslate } from "@refinedev/core";
import TextArea from "antd/es/input/TextArea";
import CustomParametersList from "../../components/form/customParametersList";

import { ModelRunTimes } from "../../components";
const { Dragger } = Upload;

export const ModelCreate = () => {
  const {
    current,
    gotoStep,
    stepsProps,
    formProps,
    saveButtonProps,
    queryResult,
    formLoading,
  } = useStepsForm<IModel>();

  const t = useTranslate();

  const { selectProps: categorySelectProps } = useSelect<IPlant>({
    resource: "power_plants",
    optionLabel: "plant_name",
    optionValue: "plant_id",
  });

  const API_URL = useApiUrl();

  const { data: paramsData, isLoading: isParamsDataLoading } = useCustom({
    url: `${API_URL}/models/weather_params`,
    method: "get",
  });

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const formList = [
    <>
      <Typography.Title level={4}>
        {t("models.edit.basicInfo")}
      </Typography.Title>
      <Form.Item
        label={t("models.fields.name.label")}
        name={["model_name"]}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={t("models.fields.type.label")}
        name={["type"]}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={t("models.fields.description.label")}
        name="description"
        rules={[]}
      >
        <TextArea
          showCount
          maxLength={100}
          style={{ height: 120, resize: "none" }}
        />
      </Form.Item>
      <Form.Item
        label={t("models.fields.plant.label")}
        name={["plant_id"]}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select {...categorySelectProps} />
      </Form.Item>
      <Form.Item
        label={t("models.fields.modelFile.label")}
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Dragger action="/upload.do" listType="picture-card">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{t("Upload model file")}</p>
          <p className="ant-upload-hint">
            {t("Drag and drop the model file here or click to upload")}
          </p>
        </Dragger>
      </Form.Item>
    </>,
    <>
      <Divider orientation="left">
        {t("parameterForm.commonParamsTitle")}
      </Divider>
      <Form.Item name="parameters">
        <Checkbox.Group
          options={paramsData?.data as CheckboxOptionType<any>[]}
        />
      </Form.Item>
      <Divider orientation="left">
        {t("parameterForm.customParamsTitle")}
      </Divider>
      <CustomParametersList />
    </>,
    <>
      <Typography.Title level={4}>
        {t("models.edit.schedules")}
      </Typography.Title>
      <Form.Item
        label={
          <>
            {t("models.autoRun")}
            <Tooltip title={t("models.autoRunDesc")}>
              <QuestionCircleOutlined
                style={{ marginLeft: 5, color: "gray", width: "12px" }}
              />
            </Tooltip>
          </>
        }
        name={["options", "auto"]}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Divider orientation="left">{t("Add custom run times")}</Divider>
      <ModelRunTimes />
    </>,
  ];

  return (
    <Create
      title={t("Create model")}
      isLoading={formLoading}
      breadcrumb={<Breadcrumb hideIcons showHome={true} />}
      footerButtons={
        <>
          {current > 0 && (
            <Button
              onClick={() => {
                gotoStep(current - 1);
              }}
            >
              {t("Previous")}
            </Button>
          )}
          {current < formList.length - 1 && (
            <Button
              onClick={() => {
                gotoStep(current + 1);
              }}
            >
              {t("Next")}
            </Button>
          )}
          {current === formList.length - 1 && (
            <SaveButton {...saveButtonProps} />
          )}
        </>
      }
    >
      <Steps
        {...stepsProps}
        items={[
          { title: t("models.edit.basicInfo") },
          { title: t("models.edit.parameters") },
          { title: t("models.edit.schedules") },
        ]}
      />

      <Form
        {...formProps}
        layout="vertical"
        style={{ paddingTop: 35, maxWidth: 800, margin: "auto" }}
      >
        {formList[current]}
      </Form>
    </Create>
  );
};
