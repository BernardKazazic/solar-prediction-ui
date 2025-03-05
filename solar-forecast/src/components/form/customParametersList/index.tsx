import { Form, Row, Col, Input, Select, Button } from "antd";
import { useTranslate } from "@refinedev/core";

const CustomParametersList = () => {
  const t = useTranslate();

  return (
    <Form.List name="custom_parameters">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name }) => (
            <Row key={key} gutter={16}>
              <Col span={24}>
                <Row gutter={16}>
                  <Col span={7}>
                    <Form.Item
                      name={[name, "name"]}
                      rules={[
                        {
                          required: true,
                          message: t(
                            "parameterForm.nameRequired",
                            "Name is required"
                          ),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t("parameterForm.namePlaceholder", "Name")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name={[name, "type"]}
                      rules={[
                        {
                          required: true,
                          message: t(
                            "parameterForm.typeRequired",
                            "Type is required"
                          ),
                        },
                      ]}
                    >
                      <Select
                        placeholder={t("parameterForm.typePlaceholder", "Type")}
                      >
                        <Select.Option value="string">
                          {t("parameterForm.typeString", "String")}
                        </Select.Option>
                        <Select.Option value="number">
                          {t("parameterForm.typeNumber", "Number")}
                        </Select.Option>
                        <Select.Option value="boolean">
                          {t("parameterForm.typeBoolean", "Boolean")}
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name={[name, "value"]}
                      rules={[
                        {
                          required: true,
                          message: t(
                            "parameterForm.valueRequired",
                            "Value is required"
                          ),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t(
                          "parameterForm.valuePlaceholder",
                          "Value"
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    span={3}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Button type="link" danger onClick={() => remove(name)}>
                      {t("parameterForm.removeButton", "Remove")}
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={() => add()} block>
              {t("parameterForm.addParameterButton", "Add parameter")}
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default CustomParametersList;
