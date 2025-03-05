import { Form, Row, Col, Button, TimePicker } from "antd";
import { useTranslate } from "@refinedev/core";
import dayjs from "dayjs";

export const ModelRunTimes = () => {
  const t = useTranslate();

  return (
    <Form.List name={["options", "run_times"]}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name }) => (
            <Row key={key} gutter={16}>
              <Col span={24}>
                <Row gutter={16}>
                  <Col span={7}>
                    <Form.Item
                      name={name}
                      rules={[
                        {
                          required: true,
                          message: t(
                            "parameters.add.timeRequired",
                            "Time is required"
                          ),
                        },
                      ]}
                      getValueProps={(value) => ({
                        value: value ? dayjs(value) : undefined,
                      })}
                    >
                      <TimePicker
                        style={{ width: "auto" }}
                        format={"HH:mm"}
                        minuteStep={15}
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
              {t("parameterForm.addTimeButton", "Add time")}
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};
