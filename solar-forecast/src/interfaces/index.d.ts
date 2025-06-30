export interface IIdentity {
  id: number;
  name: string;
  avatar: string;
}

export interface IOverviewChartType {
  date: string;
  value: number;
  type: "production" | "forecast";
  plant: string;
  measurement_unit: string;
}

export interface IPlantMapItem {
  id: number;
  name: string;
  forecasts: {
    id: number;
    name: string;
    prediction_time: string;
    power_output: number;
  }[];
  coordinates: [number, number];
}

export interface Plant {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  model_count: number;
}

export interface Model {
  id: number;
  name: string;
  type: string;
  version: number;
  features: string[];
  plant_name: string;
  is_active: boolean;
  file_type: string;
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

export interface UpdateModelRequest {
  features: string[];
  is_active: boolean;
}

export interface FeaturesResponse {
  features: string[];
}

export interface HorizonData {
  metric_type: string;
  horizon: string;
  value: string;
}

export interface CycleData {
  time_of_forecast: string;
  metric_type: string;
  value: string;
}

