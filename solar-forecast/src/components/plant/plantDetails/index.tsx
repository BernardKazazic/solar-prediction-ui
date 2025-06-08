import { Flex, List, Space, Skeleton, Typography } from "antd";
import type { Plant } from "../../../interfaces";
import { useTranslate } from "@refinedev/core";
import { useMemo } from "react";

type Props = {
  plant: Plant | undefined;
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
        title: t("plants.fields.name", "Name"),
        description: plant?.name,
      },
      {
        title: t("plants.fields.capacity"),
        description: plant?.capacity + " MW",
      },
      {
        title: t("plants.fields.modelCount", "Model Count"),
        description: plant?.model_count,
      },
      {
        title: t("plants.fields.latitude", "Latitude"),
        description: plant?.latitude,
      },
      {
        title: t("plants.fields.longitude", "Longitude"),
        description: plant?.longitude,
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
