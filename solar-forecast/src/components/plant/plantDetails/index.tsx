import { Flex, List, Space, Skeleton, Typography, Progress } from "antd";
import type { IPlant } from "../../../interfaces";
import { useTranslate } from "@refinedev/core";
import { useMemo } from "react";
import { PlantStatus } from "../plantStatus";

type Props = {
  plant: IPlant | undefined;
  isLoading: boolean;
};

export const PlantDetails = ({ plant, isLoading }: Props) => {
  const t = useTranslate();

  const formatNumber = (number: number | bigint | undefined) => {
    return number && new Intl.NumberFormat("hr-HR").format(number);
  };

  const details = useMemo(() => {
    return [
      {
        title: t("plants.fields.utilization", "Utilization"),
        description: (
          <Progress percent={plant?.utilization ?? 0} size={[120, 10]} />
        ),
      },
      {
        title: t("plants.fields.status"),
        description: <PlantStatus value={plant?.status} />,
      },
      {
        title: t("plants.fields.capacity"),
        description: plant?.capacity_mw + " MW",
      },
      {
        title: t("plants.fields.currentProduction"),
        description: plant?.current_production + " MW",
      },
      {
        title: t("plants.fields.numPanels"),
        description: formatNumber(plant?.num_panels),
      },
      {
        title: t("plants.fields.systemEfficiency"),
        description: plant?.system_efficiency + " %",
      },
      {
        title: t("plants.fields.models"),
        description: plant?.models,
      },
    ];
  }, [plant]);

  return (
    <Flex vertical>
      {isLoading ? (
        <List
          size="large"
          dataSource={details}
          renderItem={() => (
            <List.Item>
              <Flex gap={8}>
                <Space
                  style={{
                    width: "160px",
                  }}
                >
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: "100px" }}
                  />
                </Space>
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: "200px" }}
                />
              </Flex>
            </List.Item>
          )}
        />
      ) : (
        <List
          size="large"
          dataSource={details}
          renderItem={(item) => (
            <List.Item>
              <Flex gap={8}>
                <Space
                  style={{
                    width: "160px",
                  }}
                >
                  <Typography.Text type="secondary">
                    {item.title}
                  </Typography.Text>
                </Space>
                <Typography.Text>{item.description || ""}</Typography.Text>
              </Flex>
            </List.Item>
          )}
        />
      )}
    </Flex>
  );
};
