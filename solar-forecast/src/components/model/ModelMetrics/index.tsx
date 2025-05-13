import { Card, Row, Tooltip, Skeleton, Typography } from "antd";
import { CardWithContent } from "../../card";
import { useTranslate } from "@refinedev/core";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Metric } from "../../../interfaces";

type Props = {
  data: Metric[] | undefined;
  isLoading: boolean;
  updated: string | undefined;
};

const { Text } = Typography;

export const ModelMetrics = ({ data, isLoading, updated }: Props) => {
  const t = useTranslate();
  return (
    <CardWithContent title={t("models.metrics")}>
      <Row
        gutter={[16, 16]}
        wrap
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Card
                key={index}
                bordered={true}
                size={"small"}
                style={{ padding: "10px", flex: "1 1 10%", maxWidth: "20%" }}
              >
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            ))
          : data?.map(({ name, abbr, value, unit }, index) => (
              <Card
                key={index}
                title={
                  <span>
                    {abbr}
                    <Tooltip title={name}>
                      <InfoCircleOutlined
                        style={{
                          marginLeft: 8,
                          color: "gray",
                          fontSize: "12px",
                        }}
                      />
                    </Tooltip>
                  </span>
                }
                bordered={true}
                size={"small"}
                style={{ padding: "10px", flex: "1 1 10%", maxWidth: "20%" }}
              >
                {value} {unit}
              </Card>
            ))}
      </Row>
      <Row>
        <Text type="secondary" style={{ marginTop: "10px", fontSize: "12px" }}>
          {t("models.lastUpdated")}{" "}
          {updated
            ? new Date(updated).toLocaleString("hr-HR")
            : t("Not available")}
        </Text>
      </Row>
    </CardWithContent>
  );
};
