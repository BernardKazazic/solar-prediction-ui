import { useState, useEffect } from "react";
import { useApiUrl, useCustom, useParsed, useTranslate } from "@refinedev/core";
import {
  Button,
  Row,
  Typography,
  Table,
  Segmented,
  Divider,
  Checkbox,
  DatePicker,
  message,
  Flex,
} from "antd";
import { Line } from "@ant-design/plots";
import dayjs from "dayjs";
import type { IForecastData } from "../../../interfaces";
import type { TableProps } from "antd";
import {
  ExportOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

type DataType = {
  date: string;
  [key: string]: any;
};
type TablePagination<T extends object> = NonNullable<
  Exclude<TableProps<T>["pagination"], boolean>
>;
type TablePaginationPosition<T extends object> = NonNullable<
  TablePagination<T>["position"]
>[number];

const CheckboxGroup = Checkbox.Group;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const generateTableColumns = (checkedList: string[]) => {
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
  ];

  checkedList.forEach((model) => {
    columns.push({
      title: `${model}`,
      dataIndex: model,
      key: model,
    });
  });

  return columns;
};

const exportToCSV = (data: any[]) => {
  const csvRows = [];
  const headers = [
    "date",
    ...Object.keys(data[0] || {}).filter((key) => key !== "date"),
  ];
  csvRows.push(headers.join(","));

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header] !== undefined ? row[header] : "";
      return typeof value === "string" ? `"${value}"` : value;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "forecast_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const PlantForecasts = () => {
  const t = useTranslate();
  const { id } = useParsed();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const [bottom, setBottom] =
    useState<TablePaginationPosition<DataType>>("bottomRight");

  const API_URL = useApiUrl();

  const {
    data: forecastData,
    isLoading: isForecastDataLoading,
    isFetching: isForecastDataFetching,
    refetch,
  } = useCustom<IForecastData[]>({
    url: `${API_URL}/forecasts/${id}`,
    method: "get",
    config: {
      query: {
        start: dateRange ? dateRange[0] : null,
        end: dateRange ? dateRange[1] : null,
      },
    },
  });

  const isLoadingOrRefetchingForecast =
    isForecastDataLoading || isForecastDataFetching;

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

  const [checkedList, setCheckedList] = useState<string[]>([]);

  const availableModels = [
    ...new Set(forecastData?.data.map((item) => item.source)),
  ];

  useEffect(() => {
    if (forecastData?.data) {
      setCheckedList(availableModels);
    }
  }, [forecastData]);

  const filteredData = forecastData?.data.reduce<{ [key: string]: any }[]>(
    (acc, item) => {
      if (checkedList.includes(item.source)) {
        const existingEntry = acc.find(
          (entry) => entry.date === dayjs(item.date).format("DD.MM.YYYY HH:mm")
        );
        if (existingEntry) {
          existingEntry[item.source] = item.value + " " + item.measurement_unit;
        } else {
          acc.push({
            date: dayjs(item.date).format("DD.MM.YYYY HH:mm"),
            [item.source]: item.value + " " + item.measurement_unit,
          });
        }
      }
      return acc;
    },
    []
  );

  const chartProps = {
    data: forecastData?.data || [],
    xField: "date",
    yField: "value",
    seriesField: "source",
    xAxis: {
      range: [0, 1],
      label: {
        formatter: (v: string) => dayjs(v).format("DD.MM. HH:mm"),
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) =>
          `${v} ${forecastData?.data[0]?.measurement_unit}`,
      },
    },
    tooltip: {
      fields: ["date", "value", "type", "source", "measurement_unit"],
      formatter: (data: any) => {
        const formattedDate = dayjs(data.date).format("DD.MM.YYYY HH:mm");
        return {
          title: formattedDate,
          name: data.source,
          value: `${data.value.toFixed(2)} ${data.measurement_unit}`,
        };
      },
    },
  };

  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <>
      <Row>
        <RangePicker
          showTime={{ format: "HH:mm", minuteStep: 15 }}
          format="DD.MM.YYYY HH:mm"
          maxDate={dayjs().add(72, "hour")}
          onOk={(value) => handleDateChange(value)}
        />
        <Segmented
          options={[
            { label: t("Chart"), value: "chart", icon: <LineChartOutlined /> },
            {
              label: t("Table"),
              value: "table",
              icon: <UnorderedListOutlined />,
            },
          ]}
          value={view}
          onChange={setView}
          style={{ marginLeft: "20px" }}
        />
      </Row>
      <Divider style={{ margin: "13px 0" }} />
      <Row>
        {view === "chart" ? (
          <Line
            {...chartProps}
            style={{ width: "100%", height: "440px" }}
            loading={isLoadingOrRefetchingForecast}
          />
        ) : (
          <>
            <Flex
              align="center"
              justify="space-between"
              style={{ width: "100%", marginBottom: "15px" }}
            >
              <CheckboxGroup
                options={availableModels}
                value={checkedList}
                onChange={setCheckedList}
              />
              <Button
                onClick={() => exportToCSV(filteredData || [])}
                style={{ marginLeft: "auto" }}
                disabled={filteredData?.length === 0}
                icon={<ExportOutlined />}
              >
                {t("Export CSV")}
              </Button>
            </Flex>

            <Table
              dataSource={filteredData}
              columns={generateTableColumns(checkedList)}
              pagination={{ position: [bottom] }}
              style={{ width: "100%", height: "100%" }}
              size={"middle"}
              loading={isLoadingOrRefetchingForecast}
            />
          </>
        )}
      </Row>
    </>
  );
};
