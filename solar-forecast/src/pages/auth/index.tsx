import { ThemedTitleV2 } from "@refinedev/antd";
import { Button, Layout, Space, Typography } from "antd";
import { SunOutlined } from "@ant-design/icons";

import { useAuth0 } from "@auth0/auth0-react";
import { useTranslate } from "@refinedev/core";

export const AuthPage: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  const t = useTranslate();
  return (
    <Layout
      style={{
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Space direction="vertical" align="center">
        <ThemedTitleV2
          collapsed={false}
          wrapperStyles={{
            fontSize: "22px",
            marginBottom: "30px",
            lineHeight: "27px",
          }}
          text="Solar Forecast"
          icon={<SunOutlined />}
        />
        <Button
          style={{ width: "240px", marginBottom: "32px" }}
          type="primary"
          size="middle"
          onClick={() => loginWithRedirect()}
        >
          {t("Sign in", "Sign in")}
        </Button>
      </Space>
    </Layout>
  );
};
