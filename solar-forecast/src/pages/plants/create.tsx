import React from "react";
import { Breadcrumb, Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Col, Row } from "antd";
import { useTranslate } from "@refinedev/core";

export const PlantCreate: React.FC = () => {
  const t = useTranslate();
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create
      saveButtonProps={saveButtonProps}
      breadcrumb={<Breadcrumb hideIcons showHome={true} />}
      title={t("plants.titles.create")}
    >
      <Form
        {...formProps}
        layout="vertical"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <Form.Item
          label={t("plants.fields.name", "Name")}
          name="name"
          rules={[
            {
              required: true,
              message: t("common.required", "This field is required"),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Row gutter={16} style={{ marginBottom: "20px" }}>
          <Col span={12}>
            <Form.Item
              label={t("plants.fields.latitude", "Latitude")}
              name="latitude"
              rules={[
                {
                  required: true,
                  message: t("common.required", "This field is required"),
                },
                {
                  type: "number",
                  min: -90,
                  max: 90,
                  message: t(
                    "plants.fields.latitudeRange",
                    "Latitude must be between -90 and 90"
                  ),
                },
              ]}
            >
              <InputNumber 
                style={{ width: "100%" }}
                step={0.000001}
                precision={6}
                min={-90}
                max={90}
                controls={false}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t("plants.fields.longitude", "Longitude")}
              name="longitude"
              rules={[
                {
                  required: true,
                  message: t("common.required", "This field is required"),
                },
                {
                  type: "number",
                  min: -180,
                  max: 180,
                  message: t(
                    "plants.fields.longitudeRange",
                    "Longitude must be between -180 and 180"
                  ),
                },
              ]}
            >
              <InputNumber 
                style={{ width: "100%" }}
                step={0.000001}
                precision={6}
                min={-180}
                max={180}
                controls={false}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={t("plants.fields.capacity", "Capacity")}
          name="capacity"
          rules={[
            {
              required: true,
              message: t("common.required", "This field is required"),
            },
            {
              type: "number",
              min: 0,
              message: t(
                "plants.fields.capacityMin",
                "Capacity must be equal orgreater than 0"
              ),
            },
          ]}
        >
          <InputNumber 
            addonAfter="W" 
            style={{ width: "100%" }}
            step={1000}
            min={1}
            controls={false}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
