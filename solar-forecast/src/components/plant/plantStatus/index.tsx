import { Tag, Typography, theme } from "antd";
import { EyeOutlined, StopOutlined } from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";
import type { IPlant } from "../../../interfaces";
import { useConfigProvider } from "../../../context";

type Props = {
  value: IPlant["status"] | undefined;
};

export const PlantStatus = ({ value }: Props) => {
  const t = useTranslate();
  const { token } = theme.useToken();
  const { mode } = useConfigProvider();
  const isDark = mode === "dark";

  return (
    <Tag
      color={value ? "green" : "default"}
      style={{
        color: value ? token.colorSuccess : token.colorTextTertiary,
      }}
      icon={value ? <EyeOutlined /> : <StopOutlined />}
    >
      <Typography.Text
        style={{
          color: value
            ? isDark
              ? token.green7
              : "#3C8618"
            : isDark
            ? token.colorTextTertiary
            : token.colorTextTertiary,
        }}
      >
        {t(`plants.fields.isActive.${value}`)}
      </Typography.Text>
    </Tag>
  );
};
