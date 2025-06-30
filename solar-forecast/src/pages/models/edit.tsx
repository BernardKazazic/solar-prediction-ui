import {
  Breadcrumb,
  Edit,
  SaveButton,
  useStepsForm,
} from "@refinedev/antd";

import {
  Form,
  Switch,
} from "antd";

import type { Model, UpdateModelRequest } from "../../interfaces";
import { useTranslate, useList } from "@refinedev/core";
import { FormTransfer } from "../../components";

export const ModelEdit = () => {
  const {
    formProps,
    saveButtonProps,
    formLoading,
  } = useStepsForm<Model, any, UpdateModelRequest>({
    resource: "models",
    action: "edit",
    redirect: "list",
  });

  const t = useTranslate();

  const { data: featuresData, isLoading: featuresLoading } = useList({
    resource: "features",
    pagination: { mode: "off" },
  });

  // Transform features for Transfer component
  const transferData = featuresData?.data?.map((feature: any) => ({
    key: feature.value,
    title: feature.name,
  })) || [];

  return (
    <Edit
      title={t("models.titles.edit")}
      isLoading={formLoading}
      breadcrumb={<Breadcrumb hideIcons showHome={true} />}
      footerButtons={
        <>
          <SaveButton {...saveButtonProps} />
        </>
      }
    >
      <Form
        {...formProps}
        layout="vertical"
        style={{ paddingTop: 35, maxWidth: 800, margin: "auto" }}
      >
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

        <Form.Item
          label={t("models.fields.isActive.label", "Active Status")}
          name="is_active"
          valuePropName="checked"
          rules={[
            {
              required: true,
              message: t("models.fields.isActive.required", "Active status is required"),
            },
          ]}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
