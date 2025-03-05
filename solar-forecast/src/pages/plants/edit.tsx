import React from "react";
import { Breadcrumb, Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Col, Row, Divider, Switch } from "antd";
import { useTranslate } from "@refinedev/core";
import CustomParametersList from "../../components/form/customParametersList";

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
          name="plant_name"
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

        <Row gutter={[32, 16]}>
          <Col span={12}>
            <Form.Item
              label={t("plants.fields.capacity", "Capacity")}
              name="capacity_mw"
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
            <Form.Item
              label={t("plants.fields.panelHeight", "Panel Height")}
              name="panel_height"
            >
              <InputNumber addonAfter="m" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={t("plants.fields.panelWidth", "Panel Width")}
              name="panel_width"
            >
              <InputNumber addonAfter="m" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={t(
                "plants.fields.totalPanelSurface",
                "Total Panel Surface"
              )}
              name="total_panel_surface"
            >
              <InputNumber addonAfter="m²" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t("plants.fields.numPanels", "Number of Panels")}
              name="num_panels"
              rules={[
                {
                  required: true,
                  message: t(
                    "plants.fields.capacityRequired",
                    "Number of panels is required"
                  ),
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={t("plants.fields.panelEfficiency", "Panel Efficiency")}
              name="panel_efficiency"
            >
              <InputNumber addonAfter="%" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={t("plants.fields.systemEfficiency", "System Efficiency")}
              name="system_efficiency"
            >
              <InputNumber addonAfter="%" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label={t("plants.fields.isActive.label")} name="status">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Divider orientation="left">
          {t("plants.fields.customParamsTitle", "Custom Parameters")}
        </Divider>
        <CustomParametersList />
      </Form>
    </Edit>
  );
};
