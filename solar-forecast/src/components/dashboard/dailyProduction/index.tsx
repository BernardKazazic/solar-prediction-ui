import { Suspense } from "react";
import { useTranslate } from "@refinedev/core";
import { Area, type AreaConfig } from "@ant-design/plots";
import dayjs from "dayjs";

import { useConfigProvider } from "../../../context";
import { IOverviewChartType } from "../../../interfaces";

type Props = {
  data: IOverviewChartType[];
  height: number;
  loading?: boolean;
};

export const OverviewChart = ({ data, height, loading }: Props) => {
  const t = useTranslate();
  const { mode } = useConfigProvider();

  const forecastStartDate = data?.find((d: any) => d.type === "forecast")?.date;
  const currentTime =
    dayjs().minute() < 30
      ? dayjs().startOf("hour").format("YYYY-MM-DDTHH:mm:ss")
      : dayjs().add(1, "hour").startOf("hour").format("YYYY-MM-DDTHH:mm:ss");
  const config: AreaConfig = {
    isStack: true,
    data: data || [],
    xField: "date",
    yField: "value",
    seriesField: "plant",
    animation: true,
    startOnZero: true,
    smooth: true,
    legend: {
      position: "bottom",
      flipPage: false,
    },
    xAxis: {
      type: 'time',
      label: {
        formatter: (v) => {
          return dayjs(v).format("DD.MM. HH:mm");
        },
      },
    },
    yAxis: {
      label: {
        formatter: (v) => {
          return `${v} ${data && data[0]?.measurement_unit}`;
        },
      },
    },
    tooltip: {
      fields: ["date", "value", "type", "plant", "measurement_unit"],
      formatter: (data) => {
        const formattedDate = dayjs(data?.date).format("DD.MM.YYYY HH:mm");
        const translatedType =
          data?.type === "production" ? t("Production") : t("Forecast");

        return {
          title: `${formattedDate} | ${translatedType}`,
          name: `${data.plant}`,
          value: `${data.value.toFixed(2)} ${data.measurement_unit}`,
        };
      },
    },
    theme: mode,
    annotations: [
      {
        type: "line",
        start: [forecastStartDate ?? "", "min"],
        end: [forecastStartDate ?? "", "max"],
        style: {
          stroke: "#D3D3D3",
          lineWidth: 2,
          lineDash: [4, 4],
        },
      },
      {
        type: "dataMarker",
        position: [currentTime, 0],
      },
    ],
  };

  return (
    <Suspense>
      <Area {...config} height={height} loading={loading} />
    </Suspense>
  );
};
