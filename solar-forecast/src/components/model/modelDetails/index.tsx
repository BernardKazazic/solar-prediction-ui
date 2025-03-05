import { Flex, List, Skeleton, Space, Typography } from "antd";
import type { IModel } from "../../../interfaces";
import { useTranslate } from "@refinedev/core";
import { useMemo } from "react";

type Props = {
  model: IModel | undefined;
  isLoading: boolean;
};

export const ModelDetails = ({ model, isLoading }: Props) => {
  const t = useTranslate();

  const details = useMemo(() => {
    const list: {
      title: string;
      description: string;
    }[] = [
      {
        title: t("models.fields.type.label"),
        description: model?.type || "",
      },
      {
        title: t("models.fields.plant.label", "Plant"),
        description: model?.plant_name || "",
      },
      {
        title: t("models.fields.description.label", "Description"),
        description: model?.description || "",
      },
      {
        title: t("models.fields.lastRun.label", "Last run"),
        description: model?.last_run
          ? new Date(model.last_run).toLocaleString("hr-HR")
          : "",
      },
    ];

    return list;
  }, [model]);

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
                <Typography.Text>{item.description}</Typography.Text>
              </Flex>
            </List.Item>
          )}
        />
      )}
    </Flex>
  );
};
