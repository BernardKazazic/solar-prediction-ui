import { useLink } from "@refinedev/core";
import { Space, theme } from "antd";

import { Logo } from "./styled";
import { ThemedTitleV2 } from "@refinedev/antd";

type TitleProps = {
  collapsed: boolean;
};

export const Title: React.FC<TitleProps> = ({ collapsed }) => {
  const { token } = theme.useToken();
  const Link = useLink();

  return (
    <Logo>
      <Link to="/">
        {collapsed ? (
          <ThemedTitleV2 collapsed={false} icon="" text="SF" />
        ) : (
          <Space size={12}>
            <ThemedTitleV2
              collapsed={collapsed}
              icon=""
              text="Solar Forecast"
            />
          </Space>
        )}
      </Link>
    </Logo>
  );
};
