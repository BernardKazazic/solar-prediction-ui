import { Flex, List, Skeleton, Space, Typography, Tag } from "antd";
import type { Model } from "../../../interfaces";
import { useTranslate } from "@refinedev/core";
import { useMemo } from "react";

type Props = {
  model: Model | undefined;
  isLoading: boolean;
};

export const ModelDetails = ({ model, isLoading }: Props) => {
  const t = useTranslate();

  const details = useMemo(() => {
    const list: {
      title: string;
      description: string | React.ReactNode;
    }[] = [
      {
        title: "ID",
        description: model?.id?.toString() || "",
      },
      {
        title: t("models.fields.name.label"),
        description: model?.name || "",
      },
      {
        title: t("models.fields.plant.label"),
        description: model?.plant_name || "",
      },
      {
        title: t("models.fields.type.label"),
        description: model?.type ? (
          <Typography.Text style={{ textTransform: "capitalize" }}>
            {model.type}
          </Typography.Text>
        ) : "",
      },
      {
        title: t("models.fields.version.label"),
        description: model?.version ? `v${model.version}` : "",
      },
      {
        title: t("models.fields.features.label"),
        description: model?.features ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {model.features.map((feature, index) => (
              <Tag key={index}>
                {feature}
              </Tag>
            ))}
          </div>
        ) : "",
      },
      {
        title: t("models.fields.isActive.label", "Status"),
        description: model?.is_active !== undefined ? (
          <Tag color={model.is_active ? "green" : "red"}>
            {model.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
          </Tag>
        ) : "",
      },
      {
        title: t("models.fields.fileType.label", "File Type"),
        description: model?.file_type ? (
          <Tag color="blue">
            {model.file_type}
          </Tag>
        ) : "",
      },
    ];

    return list;
  }, [model, t]);

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
                <div>{item.description}</div>
              </Flex>
            </List.Item>
          )}
        />
      )}
    </Flex>
  );
};
