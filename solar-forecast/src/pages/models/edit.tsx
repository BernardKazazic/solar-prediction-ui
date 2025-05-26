import {
  Breadcrumb,
  Edit,
  SaveButton,
  useStepsForm,
} from "@refinedev/antd";

import {
  Form,
  Select,
  Switch,
} from "antd";

import type { Model, UpdateModelRequest } from "../../interfaces";
import { useTranslate } from "@refinedev/core";

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

  return (
    <Edit
      title={t("Edit model")}
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
          help={t("models.fields.features.help", "Add the features that your model uses for predictions")}
          rules={[
            {
              required: true,
              message: t("models.fields.features.required", "At least one feature is required"),
            },
          ]}
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder={t("models.fields.features.placeholder", "Type feature names and press Enter to add them")}
            tokenSeparators={[',']}
            showSearch
            notFoundContent={null}
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
