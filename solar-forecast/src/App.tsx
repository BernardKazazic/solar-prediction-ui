import React from "react";
import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbarProvider, RefineKbar } from "@refinedev/kbar";
import {
  useNotificationProvider,
  ThemedLayoutV2,
  ErrorComponent,
} from "@refinedev/antd";
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import {
  UserOutlined,
  SlidersOutlined,
  HomeOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import dataProvider from "@refinedev/simple-rest";
import axios from "axios";
import useI18nProvider from "./providers/i18nProvider";
import useAuthProvider from "./providers/authProvider";
import useAccessControlProvider from "./providers/accessControlProvider";
import "dayjs/locale/hr";
import { DashboardPage } from "./pages/dashboard";
import { PlantShow } from "./pages/plants";
import { AuthPage } from "./pages/auth";
import { UserShow, UserList } from "./pages/users";
import { PlantCreate, PlantEdit, PlantList } from "./pages/plants";
import { useTranslation } from "react-i18next";
import { Header, Title } from "./components";
import { ConfigProvider } from "./context";
import "@refinedev/antd/dist/reset.css";
import { useAuth0 } from "@auth0/auth0-react";
import { ModelCreate, ModelEdit, ModelList, ModelShow } from "./pages/models";
import { ForecastPage } from "./pages/forecasts";
import { GuestLayout } from "./layouts/GuestLayout";
import { Layout, Spin } from "antd";
import ContactButton from "./components/supportButton";
import "./styles.css";
import UserEdit from "./pages/users/edit";
import UserCreate from "./pages/users/create";

const App: React.FC = () => {
  const { isLoading } = useAuth0();
  const { t } = useTranslation();

  const i18nProvider = useI18nProvider();
  const authProvider = useAuthProvider();
  const accessControlProvider = useAccessControlProvider();

  if (isLoading) {
    return <Spin size="large" fullscreen></Spin>;
  }

  const apiUrl = "http://127.0.0.1:5000";

  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#F9A900",
          },
        }}
        locale={i18nProvider.getLocale()}
      >
        <RefineKbarProvider>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider(apiUrl, axios)}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            // @ts-expect-error
            accessControlProvider={accessControlProvider}
            notificationProvider={useNotificationProvider}
            options={{
              syncWithLocation: true,
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
            resources={[
              {
                name: "dashboard",
                list: "/",
                meta: {
                  label: t("dashboard.title", "Dashboard"),
                  icon: <HomeOutlined />,
                },
              },
              {
                name: "power_plants",
                list: "/plants",
                create: "/plants/create",
                edit: "/plants/:id/edit",
                show: "/plants/show/:id",
                meta: {
                  label: t("plants.plants", "Power plants"),
                  icon: <AppstoreOutlined />,
                },
              },
              {
                name: "users",
                list: "/users",
                create: "/users/create",
                edit: "/users/edit/:id",
                show: "/users/show/:id",
                meta: {
                  label: "Users",
                  icon: <UserOutlined />,
                },
              },
              {
                name: "models",
                list: "/models",
                create: "/models/create",
                edit: "/models/edit/:id",
                show: "/models/show/:id",
                meta: {
                  label: "Models",
                  icon: <AppstoreOutlined />,
                },
              },
              {
                name: "forecasts",
                list: "/forecasts",
                meta: {
                  label: "Forecasts",
                  icon: <SlidersOutlined />,
                },
              },
            ]}
          >
            <Routes>
              <Route
                path="/forecast/:id"
                element={
                  <GuestLayout>
                    <ForecastPage />
                  </GuestLayout>
                }
              />

              <Route
                element={
                  <Authenticated
                    key="authenticated-inner"
                    fallback={<Outlet />}
                    loading={
                      <Layout
                        style={{ height: "100vh", justifyContent: "center" }}
                      >
                        <Spin />
                      </Layout>
                    }
                  >
                    <ThemedLayoutV2
                      Header={() => <Header />}
                      Title={() => "Solar Forecast"}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route
                  index
                  element={<NavigateToResource resource="dashboard" />}
                />
                <Route path="/dashboard">
                  <Route index element={<DashboardPage />} />
                </Route>
                <Route path="/users">
                  <Route index element={<UserList />} />
                  <Route path="create" element={<UserCreate />} />
                  <Route path="edit/:id" element={<UserEdit />} />
                  <Route path="show/:id" element={<UserShow />} />
                </Route>

                <Route path="/plants">
                  <Route index element={<PlantList />} />
                  <Route path="new" element={<PlantCreate />} />
                  <Route path=":id/edit" element={<PlantEdit />} />
                  <Route path="show/:id" element={<PlantShow />} />
                  <Route path="create" element={<PlantCreate />} />
                </Route>

                <Route path="/models">
                  <Route index element={<ModelList />} />
                  <Route path="create" element={<ModelCreate />} />
                  <Route path="edit/:id" element={<ModelEdit />} />
                  <Route path="show/:id" element={<ModelShow />} />
                </Route>
              </Route>

              <Route
                element={
                  <Authenticated key="auth-pages" fallback={<Outlet />}>
                    <NavigateToResource resource="dashboard" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<AuthPage />} />
              </Route>

              <Route
                element={
                  <Authenticated key="catch-all">
                    <ThemedLayoutV2
                      Header={Header}
                      Title={() => "Solar Forecast"}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
            <ContactButton />
            <UnsavedChangesNotifier />
            <DocumentTitleHandler
              handler={({ action, params, resource }) => {
                const id = params?.id ?? "";

                const actionPrefixMatcher = {
                  create: "Create new |",
                  clone: `#${id} Clone ${resource?.meta?.label} |`,
                  edit: `#${id} Edit ${resource?.meta?.label} |`,
                  show: `#${id} ${resource?.meta?.label} |`,
                  list: `${resource?.meta?.label} |`,
                  none: "",
                };

                const suffix = " Solar Forecast";
                const title = actionPrefixMatcher[action || "none"] + suffix;

                return title;
              }}
            />
            <RefineKbar />
          </Refine>
        </RefineKbarProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
