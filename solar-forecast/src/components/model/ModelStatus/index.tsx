import { Flex, Skeleton, Spin, Tag, Typography, theme } from "antd";
import {
  CheckCircleOutlined,
  PoweroffOutlined,
  CheckOutlined,
  WarningOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";
import { useConfigProvider } from "../../../context";
import { Model } from "../../../interfaces";

interface ModelStatusProps {
  value: Model["status"];
  isLoading: boolean;
}

export const ModelStatus = ({ value, isLoading }: ModelStatusProps) => {
  const t = useTranslate();
  const { token } = theme.useToken();
  const { mode } = useConfigProvider();

  const variant: Record<
    Model["status"],
    {
      icon: JSX.Element;
      tagColor: string;
      tagTextColor: {
        dark: string;
        light: string;
      };
    }
  > = {
    ready: {
      icon: <CheckCircleOutlined />,
      tagColor: "green",
      tagTextColor: {
        dark: token.colorSuccess,
        light: "#3C8618",
      },
    },
    unavailable: {
      tagColor: "default",
      tagTextColor: {
        dark: token.colorTextTertiary,
        light: token.colorTextTertiary,
      },
      icon: <PoweroffOutlined />,
    },

    running: {
      tagColor: "default",
      tagTextColor: {
        dark: token.colorTextTertiary,
        light: token.colorTextTertiary,
      },
      icon: <LoadingOutlined />,
    },
    error: {
      tagColor: "default",
      tagTextColor: {
        dark: token.colorError,
        light: token.colorError,
      },
      icon: <WarningOutlined />,
    },
    finished: {
      tagColor: "green",
      tagTextColor: {
        dark: token.colorSuccess,
        light: "#3C8618",
      },
      icon: <CheckOutlined />,
    },
  };

  const valueText: Model["status"] = value || "ready";
  const currentVariant = variant[valueText];
  const { tagColor, tagTextColor, icon } = currentVariant;

  if (isLoading) {
    return (
      <Flex
        align="center"
        style={{
          width: "108px",
          height: "24px",
        }}
      >
        <Spin size="small" spinning>
          <Skeleton.Button
            style={{
              width: "108px",
              height: "24px",
            }}
          />
        </Spin>
      </Flex>
    );
  }

  return (
    <Tag
      color={tagColor}
      style={{
        color: tagTextColor[mode],
        marginInlineEnd: "0",
      }}
      icon={icon}
    >
      {!isLoading && (
        <Typography.Text
          style={{
            color: tagTextColor[mode],
          }}
        >
          {t(`models.fields.status.${valueText}`)}
        </Typography.Text>
      )}
    </Tag>
  );
};
