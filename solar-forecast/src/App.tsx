import { Refine } from "@refinedev/core";
import { RefineKbarProvider, RefineKbar } from "@refinedev/kbar";
import { useNotificationProvider } from "@refinedev/antd";
import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { createDataProvider } from "./providers/data";
import useI18nProvider from "./providers/i18nProvider";
import useAuthProvider from "./providers/authProvider";
import useAccessControlProvider from "./providers/accessControlProvider";
import "dayjs/locale/hr";
import { useTranslation } from "react-i18next";
import { ConfigProvider } from "./context";
import "@refinedev/antd/dist/reset.css";
import { useAuth0 } from "@auth0/auth0-react";
import { Spin } from "antd";
import ContactButton from "./components/supportButton";
import "./styles.css";
import { getRefineResources } from "./config/refineResources";
import { AppRoutes } from "./config/routes";

const App = () => {
  const { isLoading } = useAuth0();
  const { t } = useTranslation();
  const i18nProvider = useI18nProvider();
  const authProvider = useAuthProvider();
  const accessControlProvider = useAccessControlProvider();
  const resources = getRefineResources(t);

  if (isLoading) {
    return <Spin size="large" fullscreen />;
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  console.log("Creating Data provider with API URL %s", apiUrl)
  const dataProviderInstance = createDataProvider(apiUrl, authProvider);
  console.log("Created data provider successfully")
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#F9A900" },
      }}
      locale={i18nProvider.getLocale()}
    >
      <RefineKbarProvider>
        <Refine
          routerProvider={routerProvider}
          dataProvider={dataProviderInstance}
          authProvider={authProvider}
          i18nProvider={i18nProvider}
          accessControlProvider={accessControlProvider}
          notificationProvider={useNotificationProvider}
          options={{
            syncWithLocation: false,
            warnWhenUnsavedChanges: true,
            ...(i18nProvider.getLocale() !== "en" && {
              textTransformers: {
                humanize: (text) => text,
                plural: (text) => text,
                singular: (text) => text,
              },
            }),
            disableTelemetry: true,
          }}
          resources={resources}
        >
          <AppRoutes />
          <ContactButton />
          <UnsavedChangesNotifier />
          <DocumentTitleHandler
            handler={({ action, params, resource }) => {
              const id = params?.id ?? "";
              const actionPrefixMatcher = {
                create: t("common.create", "Create new |"),
                clone: `#${id} ${t("common.clone", "Clone")} ${
                  resource?.meta?.label
                } |`,
                edit: `#${id} ${t("common.edit", "Edit")} ${
                  resource?.meta?.label
                } |`,
                show: `#${id} ${t("common.show", "Show")} ${
                  resource?.meta?.label
                } |`,
                list: `${resource?.meta?.label} |`,
                none: "",
              };
              const suffix = ` ${t("common.appTitle", "Solar Forecast")}`;
              return actionPrefixMatcher[action || "none"] + suffix;
            }}
          />
          <RefineKbar />
        </Refine>
      </RefineKbarProvider>
    </ConfigProvider>
  );
};

export default App;
