import { useShow, useNavigation, useTranslate } from "@refinedev/core";
import {
  Avatar,
  Card,
  Drawer,
  Flex,
  Grid,
  List,
  Space,
  theme,
  Typography,
} from "antd";
import type { IUser } from "../../interfaces";
import { UserStatus } from "../../components";
import {
  CalendarOutlined,
  MailOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { DeleteButton, EditButton } from "@refinedev/antd";

export const UserShow = () => {
  const { list } = useNavigation();
  const breakpoint = Grid.useBreakpoint();
  const { query: queryResult } = useShow<IUser>();

  const { data } = queryResult;
  const user = data?.data;
  const t = useTranslate();
  const { token } = theme.useToken();
  return (
    <Drawer
      open
      onClose={() => list("users")}
      width={breakpoint.sm ? "600px" : "100%"}
      title={t("User details")}
      extra={
        <Space>
          <EditButton recordItemId={user?.id} />
          <DeleteButton recordItemId={user?.id} />
        </Space>
      }
      styles={{
        body: {
          backgroundColor: token.colorBgLayout,
          borderLeft: `1px solid ${token.colorBorderSecondary}`,
          padding: "0",
        },
      }}
    >
      <Flex
        vertical
        gap={32}
        style={{
          padding: "32px",
        }}
      >
        <Flex align="center" gap={32}>
          <Avatar size={96} src={user?.avatar_url} />
          <Flex vertical>
            <Typography.Title
              level={3}
              style={{
                margin: 0,
              }}
            >
              {user?.full_name}
            </Typography.Title>
          </Flex>
        </Flex>
        <Card
          bordered={false}
          styles={{
            body: {
              padding: "0 16px 0 16px",
            },
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                title: t("users.fields.username"),
                icon: <TagOutlined />,
                value: <Typography.Text>{user?.username}</Typography.Text>,
              },
              {
                title: t("users.fields.email"),
                icon: <MailOutlined />,
                value: <Typography.Text>{user?.email}</Typography.Text>,
              },
              {
                title: t("users.fields.role"),
                icon: <UserOutlined />,
                value: <Typography.Text>{user?.role}</Typography.Text>,
              },
              {
                title: t("users.fields.status", "Status"),
                icon: <UserOutlined />,
                value: (
                  <Typography.Text>
                    {<UserStatus value={user?.active} />}
                  </Typography.Text>
                ),
              },
              {
                title: t("users.fields.createdAt"),
                icon: <CalendarOutlined />,
                value: (
                  <Typography.Text>
                    {dayjs(user?.createdAt).format("MMMM, YYYY HH:mm A")}
                  </Typography.Text>
                ),
              },
            ]}
            renderItem={(item) => {
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.icon}
                    title={
                      <Typography.Text type="secondary">
                        {item.title}
                      </Typography.Text>
                    }
                    description={item.value}
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      </Flex>
    </Drawer>
  );
};
