import { Layout, Spin } from "antd";
import { Authenticated } from "@refinedev/core";
import { ThemedLayoutV2, ErrorComponent } from "@refinedev/antd";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Header } from "../components";
import { GuestLayout } from "../layouts/GuestLayout";
import { ModelCreate, ModelEdit, ModelList, ModelShow } from "../pages/models";
import { AuthPage } from "../pages/auth";
import { DashboardPage } from "../pages/dashboard";
import { ForecastPage } from "../pages/forecasts";
import { PermissionManager } from "../pages/permissions/";
import { PlantCreate, PlantEdit, PlantList, PlantShow } from "../pages/plants";
import { RoleCreate, RoleEdit, RoleList, RoleShow } from "../pages/roles/";
import { UserEdit } from "../pages/users/edit";
import { UserList } from "../pages/users";

export const AppRoutes = () => {
  const { t } = useTranslation();
  return (
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
        path="/"
        element={
          <Authenticated
            key="authenticated-root"
            fallback={<Navigate to="/login" />}
            loading={
              <Layout style={{ height: "100vh", justifyContent: "center" }}>
                <Spin />
              </Layout>
            }
          >
            <Navigate to="/dashboard" />
          </Authenticated>
        }
      />
      <Route
        element={
          <Authenticated
            key="authenticated-inner"
            fallback={<Outlet />}
            loading={
              <Layout style={{ height: "100vh", justifyContent: "center" }}>
                <Spin />
              </Layout>
            }
          >
            <ThemedLayoutV2
              Header={() => <Header />}
              Title={() => t("common.appTitle", "Solar Forecast")}
            >
              <Outlet />
            </ThemedLayoutV2>
          </Authenticated>
        }
      >
        <Route path="/dashboard">
          <Route index element={<DashboardPage />} />
        </Route>
        <Route path="/users">
          <Route index element={<UserList />} />
          <Route path="edit/:id" element={<UserEdit />} />
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
        <Route path="/roles">
          <Route index element={<RoleList />} />
          <Route path="create" element={<RoleCreate />} />
          <Route path="edit/:id" element={<RoleEdit />} />
          <Route path="show/:id" element={<RoleShow />} />
        </Route>
        <Route path="/permissions">
          <Route index element={<PermissionManager />} />
        </Route>
      </Route>
      <Route
        element={
          <Authenticated key="auth-pages" fallback={<Outlet />}>
            <Navigate to="/dashboard" />
          </Authenticated>
        }
      >
        <Route path="/login" element={<AuthPage />} />
      </Route>
      <Route
        element={
          <Authenticated key="catch-all">
            <ThemedLayoutV2 Header={Header} Title={() => "Solar Forecast"}>
              <Outlet />
            </ThemedLayoutV2>
          </Authenticated>
        }
      >
        <Route path="*" element={<ErrorComponent />} />
      </Route>
    </Routes>
  );
};
