import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ConfigProvider as AntdConfigProvider,
  theme,
  type ThemeConfig,
} from "antd";
import { ThemeProvider } from "antd-style";
import { RefineThemes } from "@refinedev/antd";
import "./config.css";
import hrHR from "antd/locale/hr_HR";

type Mode = "light" | "dark";

type ConfigProviderContext = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

export const ConfigProviderContext = createContext<
  ConfigProviderContext | undefined
>(undefined);

const defaultMode: Mode = (localStorage.getItem("theme") as Mode) || "light";

type ConfigProviderProps = {
  theme?: ThemeConfig;
  locale: string;
};

export const ConfigProvider = ({
  theme: themeFromProps,
  locale,
  children,
}: PropsWithChildren<ConfigProviderProps>) => {
  const [mode, setMode] = useState<Mode>(defaultMode);

  const handleSetMode = (mode: Mode) => {
    localStorage.setItem("theme", mode);
    const html = document.querySelector("html");
    html?.setAttribute("data-theme", mode);
    setMode(mode);
  };

  useEffect(() => {
    const html = document.querySelector("html");
    html?.setAttribute("data-theme", mode);
  }, []);

  return (
    <ConfigProviderContext.Provider value={{ mode, setMode: handleSetMode }}>
      <AntdConfigProvider
        theme={{
          ...RefineThemes.Orange,
          algorithm:
            mode === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
          ...themeFromProps,
        }}
        locale={locale == "hr" ? hrHR : undefined}
      >
        <ThemeProvider appearance={mode}>{children}</ThemeProvider>
      </AntdConfigProvider>
    </ConfigProviderContext.Provider>
  );
};

export const useConfigProvider = () => {
  const context = useContext(ConfigProviderContext);

  if (context === undefined) {
    throw new Error("useConfigProvider must be used within a ConfigProvider");
  }

  return context;
};
