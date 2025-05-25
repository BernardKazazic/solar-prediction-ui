import {
  useNavigation,
  useInfiniteList,
  useList,
  useTranslation,
  useTranslate,
} from "@refinedev/core";
import { Typography, Skeleton, Spin, theme, List, Popover } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";
import "dayjs/locale/hr";
import InfiniteScroll from "react-infinite-scroll-component";
import { IEvent, LegacyModel } from "../../../interfaces";
import { ModelStatus } from "../../model/ModelStatus";

dayjs.extend(relativeTime);

type Props = {
  height?: string;
  modelId?: number;
};

export const ModelTimeline = ({ height = "600px", modelId }: Props) => {
  const { token } = theme.useToken();
  const { show } = useNavigation();
  const { getLocale } = useTranslation();
  const t = useTranslate();
  const currentLocale = getLocale();

  dayjs.locale(currentLocale);

  const {
    data: eventData,
    isLoading: isEventsLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteList<IEvent>({
    resource: "events",
    filters: modelId
      ? [
          {
            field: "model_id",
            operator: "eq",
            value: modelId,
          },
        ]
      : undefined,
    sorters: [{ field: "datetime", order: "desc" }],
    pagination: { current: 1, pageSize: 10 },
  });

  const { data: modelData, isLoading: isModelsLoading } = useList<LegacyModel>({
    resource: "models",
  });

  const events = eventData?.pages.flatMap((page) => page.data) || [];
  const models = modelData?.data || [];

  const getModelNameById = (modelId: string) =>
    models.find((model) => Number(model.model_id) === Number(modelId))
      ?.model_name || "Unknown Model";

  return (
    <div
      id="scrollableDiv"
      style={{
        display: "block",
        overflow: "auto",
        maxHeight: height,
      }}
    >
      <InfiniteScroll
        dataLength={events.length}
        next={() => fetchNextPage()}
        hasMore={!!hasNextPage}
        style={{ display: "flex", flexDirection: "column" }}
        loader={
          <Spin
            spinning
            style={{
              height: "56px",
              display: "flex",
              justifyContent: "center",
              marginTop: "16px",
            }}
          />
        }
        scrollableTarget="scrollableDiv"
      >
        <List
          itemLayout="horizontal"
          dataSource={events}
          renderItem={(item) => {
            const modelName = getModelNameById(item.model_id);
            return (
              <List.Item
                style={{
                  cursor: "pointer",
                  height: "54px",
                  padding: "16px",
                }}
                actions={[
                  <Typography.Text
                    style={{ color: token.colorTextDescription }}
                    key={"datetime"}
                  >
                    {dayjs(item.datetime).fromNow()}
                  </Typography.Text>,
                ]}
                onClick={() => show("models", item.model_id)}
              >
                <Skeleton
                  style={{ display: "flex", width: "100%" }}
                  avatar={false}
                  title={false}
                  paragraph={{ rows: 1, width: "100%" }}
                  loading={isEventsLoading || isModelsLoading}
                  active
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "128px" }}>
                      <Typography.Text strong>{modelName}</Typography.Text>
                    </div>
                    <Popover
                      content={item.description || t("models.noDesc")}
                      title={t("Details")}
                      overlayStyle={{ zIndex: 1050 }}
                    >
                      <div style={{ marginLeft: "16px" }}>
                        <ModelStatus
                          value={item.status}
                          isLoading={isEventsLoading}
                        />
                      </div>
                    </Popover>
                  </div>
                </Skeleton>
              </List.Item>
            );
          }}
        />
      </InfiniteScroll>
    </div>
  );
};
