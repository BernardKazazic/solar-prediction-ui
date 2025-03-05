import { useState } from "react";
import { useSelect } from "@refinedev/antd";
import {
  useApiUrl,
  useCustom,
  useParsed,
  useShow,
  useTranslate,
} from "@refinedev/core";
import { message, Row, Select } from "antd";
import { Flex } from "antd";
import type { SelectProps } from "antd";
import { Line } from "@ant-design/plots";
import { DatePicker } from "antd";
import { Divider } from "antd";
import { IMetricsData } from "../../../interfaces";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

const options: SelectProps["options"] = [];

for (let i = 10; i < 36; i++) {
  options.push({
    label: i.toString(36) + i,
    value: i.toString(36) + i,
  });
}

export const ModelAccuracyChart = () => {
  const { queryResult } = useShow({});
  const { data } = queryResult;
  const record = data?.data;
  const { id } = useParsed();
  const t = useTranslate();
  const [otherModels, setOtherModels] = useState<string[]>([]);
  const [metric, setMetric] = useState<string | null>(null);

  const { selectProps: modelsSelectProps } = useSelect({
    resource: "models",
    optionLabel: "model_name",
    optionValue: "model_id",
    filters: [{ field: "plant_id", operator: "eq", value: record?.plant_id }],
  });

  const { selectProps: metricsSelectProps } = useSelect({
    resource: "metrics/available",
    optionLabel: "label",
    optionValue: "value",
    filters: [{ field: "model_id", operator: "eq", value: id }],
  });

  const API_URL = useApiUrl();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const {
    data: metricsData,
    isLoading: isMetricsDataLoading,
    isFetching: isMetricsDataFetching,
    refetch,
  } = useCustom<IMetricsData[]>({
    url: `${API_URL}/metrics/${id}`,
    method: "get",
    config: {
      query: Object.fromEntries(
        Object.entries({
          start: dateRange ? dateRange[0] : null,
          end: dateRange ? dateRange[1] : null,
          other_models: otherModels.length > 0 ? otherModels : null,
          metric: metric ? metric : null,
        }).filter(([_, value]) => value !== null && value !== undefined) 
      ),
    },
  });

  const isLoadingOrRefetchingMetrics =
    isMetricsDataLoading || isMetricsDataFetching;

  const handleDateChange = (dates: any[]) => {
    if (dates[0] && dates[1]) {
      const [start, end] = dates;
      if (end.isBefore(start)) {
        message.error(t("End date must be after the start date."));
        return;
      }
      const startDate = dates[0].format("YYYY-MM-DDTHH:mm:ss");
      const endDate = dates[1].format("YYYY-MM-DDTHH:mm:ss");
      setDateRange([startDate, endDate]);

      refetch();
    }
  };

  const handleCompare = (models: string[]) => {
    setOtherModels(models);
    refetch();
  };

  const handleMetric = (metric: string) => {
    setMetric(metric);
    refetch();
  };

  const chartProps = {
    data: metricsData?.data || [],
    xField: "date",
    yField: "value",
    seriesField: "model",
    xAxis: {
      range: [0, 1],
      label: {
        formatter: (v: string) => dayjs(v).format("DD.MM. HH:mm"),
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) =>
          `${v} ${metricsData?.data[0]?.measurement_unit}`,
      },
    },
    tooltip: {
      fields: ["date", "value", "model", "metric", "measurement_unit"],
      formatter: (data: any) => {
        const formattedDate = dayjs(data.date).format("DD.MM.YYYY HH:mm");
        return {
          title: `${formattedDate} | ${data.metric}`,
          name: data.model,
          value: `${data.value.toFixed(2)} ${data.measurement_unit}`,
        };
      },
    },
  };
  const disabledTime = (date: Dayjs | null) => {
    const currentDayjs = dayjs();

    if (!date) return {};

    const hours: number[] = [];
    const minutes: number[] = [];

    for (let i = 0; i < 24; i++) {
      if (i < currentDayjs.hour()) {
        continue;
      } else if (i === currentDayjs.hour()) {
        for (let j = currentDayjs.minute() + 1; j < 60; j++) {
          minutes.push(j);
        }
      }
      if (i > currentDayjs.hour()) {
        hours.push(i);
      }
    }

    return {
      disabledHours: () => hours,
      disabledMinutes: (hour: number) =>
        hour === currentDayjs.hour() ? minutes : [],
      disabledSeconds: () => [1, 2, 3],
    };
  };
  return (
    <>
      <Row style={{ padding: "10px" }}>
        <Flex
          justify="flex-start"
          gap="small"
          align="center"
          style={{ width: "100%" }}
        >
          <RangePicker
            showTime={{ format: "HH:mm", minuteStep: 15 }}
            format="DD.MM.YYYY HH:mm"
            maxDate={dayjs()}
            onOk={(value) => handleDateChange(value)}
            disabledTime={disabledTime}
          />
          <Select
            mode="multiple"
            allowClear
            style={{ flex: 1 }}
            placeholder={t("models.compare")}
            onChange={(value) => handleCompare(value as unknown as string[])}
            {...modelsSelectProps}
          />
          <Select
            onChange={(value) => handleMetric(value as unknown as string)}
            placeholder={t("models.metrics")}
            style={{ width: "15%" }}
            {...metricsSelectProps}
          />
        </Flex>
      </Row>
      <Row>
        <Divider style={{ margin: "5px 0" }} />
        <Line
          {...chartProps}
          style={{ width: "99%" }}
          height={470}
          loading={isLoadingOrRefetchingMetrics}
          animation={false}
        />
      </Row>
    </>
  );
};
