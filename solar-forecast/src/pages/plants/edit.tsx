import React from "react";
import { Breadcrumb, Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Col, Row } from "antd";
import { useTranslate } from "@refinedev/core";

export const PlantEdit: React.FC = () => {
  const t = useTranslate();
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      breadcrumb={<Breadcrumb hideIcons showHome={true} />}
      title={t("plants.titles.edit")}
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
              message: t("plants.fields.nameRequired", "Name is required"),
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
                  message: t(
                    "plants.fields.latitudeRequired",
                    "Latitude is required"
                  ),
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t("plants.fields.longitude", "Longitude")}
              name="longitude"
              rules={[
                {
                  required: true,
                  message: t(
                    "plants.fields.longitudeRequired",
                    "Longitude is required"
                  ),
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={t("plants.fields.capacity", "Capacity")}
          name="capacity"
          rules={[
            {
              required: true,
              message: t(
                "plants.fields.capacityRequired",
                "Capacity is required"
              ),
            },
          ]}
        >
          <InputNumber addonAfter="MW" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
