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

export interface Plant {
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

export interface Metric {
  name: string;
  abbr: string;
  value: number;
  unit: string;
}

export interface Options {
  enabled: boolean;
  auto: boolean;
  run_times: string[];
}

export interface Model {
  id: number;
  name: string;
  type: string;
  version: number;
  features: string[];
  plant_name: string;
}

export interface LegacyModel {
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
  metrics: Metric[];
  options: Options;
  metrics_updated: string;
  last_run: string;
}

export interface PaginatedModelsResponse {
  models: Model[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RoleInfo {
  id: string;
  name: string;
}

export interface UserResponse extends BaseRecord {
  id: string;
  email: string;
  name: string;
  picture: string;
  lastLogin: string;
  roles: RoleInfo[];
}

export interface PaginatedUserResponse {
  content: UserResponse[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface CreateUserRequest {
  email: string;
  connection: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  roleIds: string[];
}

export interface CreateUserTicketResponse {
  ticketUrl: string;
}

export interface PermissionResponse {
  permissionName: string;
  description: string;
}

export interface PaginatedPermissionResponse {
  content: PermissionResponse[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface PaginatedRoleResponse {
  content: RoleResponse[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdatePermissionsRequest {
  permissions: {
    permissionName: string;
    description: string;
  }[];
}

