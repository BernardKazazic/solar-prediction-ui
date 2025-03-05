import type { Dayjs } from "dayjs";

export interface IUser {
  id: number;
  full_name: string;
  createdAt: string;
  isActive: boolean;
  avatar_url: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
}

export interface IIdentity {
  id: number;
  name: string;
  avatar: string;
}

export interface IFile {
  name: string;
  percent: number;
  size: number;
  status: "error" | "success" | "done" | "uploading" | "removed";
  type: string;
  uid: string;
  url: string;
}

export interface IEvent {
  date: string;
  status: string;
  description: string;
  model_id: string;
  datetime: string;
}

export interface IOverviewChartType {
  date: string;
  value: number;
  type: "production" | "forecast";
  plant: string;
  measurement_unit: string;
}

export interface IPlantMapItem {
  id: string;
  name: string;
  forecast: any[];
  current_production: number;
  installed_capacity: number;
  measurement_unit: string;
  utilization_percentage: number;
  coordinates: [number, number];
}

export interface IForecastData {
  date: string;
  measurement_unit: string;
  source: string;
  type: string;
  value: number;
}

export interface IMetricsData {
  date: string;
  measurement_unit: string;
  source: string;
  type: string;
  value: number;
}

export interface CustomParameter {
  name: string;
  type: "string" | "number" | "boolean";
  value: string | number | boolean;
}

export interface IPlant {
  plant_id: number;
  plant_name: string;
  latitude: number;
  longitude: number;
  capacity_mw: number;
  num_panels: number;
  panel_height: number;
  panel_width: number;
  total_panel_surface: number;
  panel_efficiency: number;
  system_efficiency: number;
  total_surface_and_efficiency: number;
  status: string;
  models: string[];
  current_production: number;
  utilization: number;
  custom_parameters: CustomParameter[];
}

export interface IMetric {
  name: string;
  abbr: string;
  value: number;
  unit: string;
}

export interface IOptions {
  enabled: boolean;
  auto: boolean;
  run_times: string[];
}

export interface IModel {
  model_id: number;
  model_name: string;
  description: string;
  plant_id: number;
  plant_name: string;
  accuracy: number;
  best: boolean;
  type: string;
  status: string;
  parameters: string[];
  custom_parameters: CustomParameter[];
  metrics: IMetric[];
  options: IOptions;
  metrics_updated: string;
  last_run: string;
}
