import {
  AppstoreOutlined,
  HomeOutlined,
  KeyOutlined,
  SettingOutlined,
  SlidersOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { TFunction } from "react-i18next";

// Export a function to get resources, so translation hook can be used
export const getRefineResources = (t: TFunction) => [
  {
    name: "dashboard",
    list: "/dashboard",
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
    name: "models",
    list: "/models",
    create: "/models/create",
    edit: "/models/edit/:id",
    show: "/models/show/:id",
    meta: {
      label: t("models.models", "Models"),
      icon: <AppstoreOutlined />,
    },
  },
  {
    name: "forecasts",
    list: "/forecasts",
    meta: {
      label: t("forecasts.title", "Forecasts"),
      icon: <SlidersOutlined />,
    },
  },
  {
    name: "admin",
    meta: {
      label: t("admin.title", "Admin"),
      icon: <SettingOutlined />,
    },
  },
  {
    name: "users",
    list: "/users",
    edit: "/users/edit/:id",
    meta: {
      label: t("users.title", "User Management"),
      icon: <UserOutlined />,
      canDelete: true,
      parent: "admin",
    },
  },
  {
    name: "roles",
    list: "/roles",
    create: "/roles/create",
    edit: "/roles/edit/:id",
    show: "/roles/show/:id",
    meta: {
      label: t("roles.title", "Role Management"),
      icon: <TeamOutlined />,
      parent: "admin",
      canDelete: true,
    },
  },
  {
    name: "permissions",
    list: "/permissions",
    meta: {
      label: t("permissions.title", "Permission Management"),
      icon: <KeyOutlined />,
      parent: "admin",
    },
  },
];
