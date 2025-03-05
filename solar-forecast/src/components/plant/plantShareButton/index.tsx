import { Input, Popover, message, Button } from "antd";
import { CopyOutlined, ShareAltOutlined } from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";

export const PlantShareButton = ({
  powerPlantId,
}: {
  powerPlantId: string | number | undefined;
}) => {
  const t = useTranslate();

  const forecastUrl = `/forecast/${powerPlantId}`;
  const fullUrl = window.location.origin + forecastUrl;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => message.success(t("plants.share.copySuccess")))
      .catch(() => message.error(t("plants.share.copyError")));
  };

  const popoverContent = (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Input
        value={fullUrl}
        style={{ flex: 1, width: "100%" }}
        suffix={
          <Button size="small" onClick={handleCopy}>
            <CopyOutlined />
          </Button>
        }
      />
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      title={t("plants.share.shareForecast")}
      overlayStyle={{ width: "280px" }}
    >
      <Button icon={<ShareAltOutlined />}>{t("plants.share.share")}</Button>
    </Popover>
  );
};
