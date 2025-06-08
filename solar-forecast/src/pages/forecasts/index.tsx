import { Row, Col, Skeleton, Typography } from "antd";
import { useParsed, useShow, useTranslate } from "@refinedev/core";
import { PlantForecasts } from "../../components";
import { List } from "@refinedev/antd";

export const ForecastPage: React.FC = () => {
  const t = useTranslate();
  const { id } = useParsed();
  const { queryResult } = useShow({
    resource: "power_plant",
    id,
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <List
      title={
        isLoading ? (
          <Skeleton.Input
            active
            style={{
              width: "144px",
              minWidth: "144px",
              height: "28px",
            }}
          />
        ) : (
          <Typography.Title level={2}>{record?.name}</Typography.Title>
        )
      }
      headerButtons={() => <></>}
      breadcrumb
    >
      <Row gutter={[16, 16]}>
        <Col md={24}>
          <PlantForecasts />
        </Col>
      </Row>
    </List>
  );
};
