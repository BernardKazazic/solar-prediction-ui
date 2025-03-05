import { useNavigation } from "@refinedev/core";
import { MapContainer, TileLayer } from "react-leaflet";
import { Line } from "@ant-design/plots";
import { Button, Progress, Popover, Typography, List, Flex, Card } from "antd";
import { JSXMarker } from "../../map";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { IPlantMapItem } from "../../../interfaces";

type Props = {
  data: IPlantMapItem[] | undefined;
};

export const AllPlantsMap = ({ data }: Props) => {
  const { show } = useNavigation();
  const { t } = useTranslation();

  const handleViewPlant = (plantId: string) => {
    let el = document.body;
    el.dispatchEvent(new MouseEvent("mousedown"));
    el.dispatchEvent(new MouseEvent("mouseup"));
    el.dispatchEvent(new MouseEvent("click"));

    // Navigate to the plant page
    show("power_plants", plantId);
  };

  return (
    <MapContainer
      center={[44.4737849, 16.3688717]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <TileLayer
        url="https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=523c79891a229b1a91756770f201b921"
        attribution="&copy; OpenWeatherMap"
      />

      {data?.map((plant) => {
        const popoverContent = (
          <Flex vertical gap={4}>
            <Typography.Title level={4}>{plant.name}</Typography.Title>
            <Card size="small" title={t("chart.forecast", "Forecast")}>
              <Line
                data={plant.forecast}
                xField="date"
                yField="value"
                height={200}
                width={300}
                smooth
                point={{ size: 2 }}
                xAxis={{
                  range: [0, 1],
                  label: {
                    formatter: (v) => dayjs(v).format("HH"),
                  },
                }}
                yAxis={{
                  label: {
                    formatter: (v) => `${v} kW`,
                  },
                }}
                tooltip={{
                  fields: ["date", "value", "measurement_unit"],
                  formatter: (data) => {
                    const formattedDate = dayjs(data.date).format(
                      "DD.MM.YYYY HH:mm"
                    );

                    return {
                      title: `${formattedDate}`,
                      name: `${t("chart.forecast", "Forecast")}`,
                      value: `${data.value.toFixed(2)} ${
                        data.measurement_unit
                      }`,
                    };
                  },
                }}
              />
            </Card>

            <List
              dataSource={[
                {
                  title: t(
                    "dashboard.currentProduction.title",
                    "Current production"
                  ),
                  value: `${plant.current_production} ${plant.measurement_unit}`,
                },
                {
                  title: t(
                    "dashboard.installedCapacity.title",
                    "Installed capacity"
                  ),
                  value: `${plant.installed_capacity} ${plant.measurement_unit}`,
                },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Typography.Text strong>{item.title} </Typography.Text>
                  <Typography.Text>{item.value}</Typography.Text>
                </List.Item>
              )}
            />
            <Button
              type="primary"
              style={{ marginTop: "10px" }}
              onClick={() => handleViewPlant(plant.id)}
            >
              {t("dashboard.viewPlant", "View plant")}
            </Button>
          </Flex>
        );

        return (
          <JSXMarker
            position={plant?.coordinates}
            iconOptions={{
              className: "jsx-marker",
              iconSize: [60, 60],
              iconAnchor: [30, 70],
            }}
          >
            <Popover key={plant.id} content={popoverContent} trigger="click">
              <div>
                <Progress
                  type="dashboard"
                  steps={10}
                  percent={plant.utilization_percentage}
                  trailColor="rgba(0, 0, 0, 0.2)"
                  strokeWidth={18}
                  format={(percent) => `${percent}%`}
                  size={50}
                  showInfo={true}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "50%",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.25)",
                    padding: "4px",
                  }}
                />
                <div
                  style={{
                    content: "''",
                    position: "absolute",
                    bottom: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "0",
                    height: "0",
                    borderStyle: "solid",
                    borderWidth: "20px 10px 0 10px",
                    borderColor:
                      "rgba(255, 255, 255, 0.95) transparent transparent transparent",
                    zIndex: "-1",
                  }}
                />
              </div>
            </Popover>
          </JSXMarker>
        );
      })}
    </MapContainer>
  );
};
