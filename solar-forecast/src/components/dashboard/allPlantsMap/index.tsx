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
    show("power_plant", plantId);
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
        const forecastChartData = plant.forecasts?.map((forecast) => ({
          date: forecast.prediction_time,
          value: forecast.power_output,
          measurement_unit: "W",
        })) || [];

        const popoverContent = (
          <Flex vertical gap={4}>
            <Typography.Title level={4}>{plant.name}</Typography.Title>
            <Card size="small" title={t("chart.forecast", "Forecast")}>
              <Line
                data={forecastChartData}
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
                    formatter: (v) => `${v} W`,
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

            <Button
              type="primary"
              style={{ marginTop: "10px" }}
              onClick={() => handleViewPlant(plant.id.toString())}
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
              iconSize: [40, 40],
              iconAnchor: [20, 40],
            }}
          >
            <Popover key={plant.id} content={popoverContent} trigger="click">
              <div style={{ position: "relative", cursor: "pointer" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50% 50% 50% 0",
                    backgroundColor: "#1890ff",
                    transform: "rotate(-45deg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                    border: "3px solid white",
                  }}
                >
                  <div
                    style={{
                      transform: "rotate(45deg)",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "white",
                      textAlign: "center",
                      lineHeight: "1",
                    }}
                  >
                    {plant.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>
            </Popover>
          </JSXMarker>
        );
      })}
    </MapContainer>
  );
};
