import axios, { AxiosInstance } from "axios";
import {
  DataProvider,
  HttpError,
  GetListParams,
  GetListResponse,
  BaseRecord,
  CreateParams,
  CreateResponse,
  GetOneParams,
  GetOneResponse,
  DeleteOneParams,
  DeleteOneResponse,
  UpdateParams,
  UpdateResponse,
  GetManyParams,
  GetManyResponse,
  CreateManyParams,
  UpdateManyParams,
  DeleteManyParams,
  CustomParams,
  CreateManyResponse,
  UpdateManyResponse,
  DeleteManyResponse,
  CustomResponse,
} from "@refinedev/core";
import baseDataProviderRest from "@refinedev/simple-rest";
import { AuthProvider } from "@refinedev/core";
import { createUserDataProvider } from "./userDataProvider";
import { createRoleDataProvider } from "./roleDataProvider";
import { createPermissionDataProvider } from "./permissionDataProvider";

export const createDataProvider = (
  apiUrl: string,
  authProvider: AuthProvider & { getAccessToken?: () => Promise<string | null> }
): DataProvider => {
  const axiosInstance: AxiosInstance = axios.create();

  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = await authProvider.getAccessToken?.();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      const httpError: HttpError = {
        message: error.message,
        statusCode: error.response?.status || 500,
      };
      return Promise.reject(httpError);
    }
  );

  const baseDataProvider: DataProvider = baseDataProviderRest(
    apiUrl,
    axiosInstance
  );
  const userDataProvider = createUserDataProvider(apiUrl, axiosInstance);
  const roleDataProvider = createRoleDataProvider(apiUrl, axiosInstance);
  const permissionDataProvider = createPermissionDataProvider(
    apiUrl,
    axiosInstance
  );

  return {
    getApiUrl: baseDataProvider.getApiUrl,

    getList: <TData extends BaseRecord = BaseRecord>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> => {
      const { resource } = params;
      if (resource === "users") {
        return userDataProvider.getList(params) as Promise<
          GetListResponse<TData>
        >;
      }
      if (resource === "roles") {
        return roleDataProvider.getList(params) as Promise<
          GetListResponse<TData>
        >;
      }
      if (resource === "permissions") {
        return permissionDataProvider.getList(params) as Promise<
          GetListResponse<TData>
        >;
      }
      console.warn(
        `getList: No specific provider for resource '${resource}'. Using base provider.`
      );
      return baseDataProvider.getList<TData>(params);
    },

    getMany: <TData extends BaseRecord = BaseRecord>(
      params: GetManyParams
    ): Promise<GetManyResponse<TData>> => {
      if (!baseDataProvider.getMany) {
        throw new Error("getMany not implemented by base data provider.");
      }
      return baseDataProvider.getMany<TData>(params);
    },

    getOne: <TData extends BaseRecord = BaseRecord>(
      params: GetOneParams
    ): Promise<GetOneResponse<TData>> => {
      const { resource } = params;
      if (resource === "users") {
        return userDataProvider.getOne(params) as Promise<
          GetOneResponse<TData>
        >;
      }
      if (resource === "roles") {
        return roleDataProvider.getOne(params) as Promise<
          GetOneResponse<TData>
        >;
      }
      console.warn(
        `getOne: No specific provider for resource '${resource}'. Using base provider.`
      );
      return baseDataProvider.getOne<TData>(params);
    },

    create: <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: CreateParams<TVariables>
    ): Promise<CreateResponse<TData>> => {
      const { resource } = params;
      if (resource === "users") {
        return userDataProvider.create(params) as Promise<
          CreateResponse<TData>
        >;
      }
      if (resource === "roles") {
        return roleDataProvider.create(params) as Promise<
          CreateResponse<TData>
        >;
      }
      console.warn(
        `create: No specific provider for resource '${resource}'. Using base provider.`
      );
      return baseDataProvider.create<TData, TVariables>(params);
    },

    createMany: <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: CreateManyParams<TVariables>
    ): Promise<CreateManyResponse<TData>> => {
      if (!baseDataProvider.createMany) {
        throw new Error("createMany not implemented by base data provider.");
      }
      return baseDataProvider.createMany<TData, TVariables>(params);
    },

    update: <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> => {
      const { resource } = params;
      if (resource === "users") {
        return userDataProvider.update(params) as Promise<
          UpdateResponse<TData>
        >;
      }
      if (resource === "roles") {
        return roleDataProvider.update(params) as Promise<
          UpdateResponse<TData>
        >;
      }
      if (resource === "permissions") {
        return permissionDataProvider.update(params) as Promise<
          UpdateResponse<TData>
        >;
      }
      console.warn(
        `update: No specific provider for resource '${resource}'. Using base provider.`
      );
      return baseDataProvider.update<TData, TVariables>(params);
    },

    updateMany: <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: UpdateManyParams<TVariables>
    ): Promise<UpdateManyResponse<TData>> => {
      if (!baseDataProvider.updateMany) {
        throw new Error("updateMany not implemented by this data provider.");
      }
      return baseDataProvider.updateMany<TData, TVariables>(params);
    },

    deleteOne: <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> => {
      const { resource } = params;
      if (resource === "users") {
        return userDataProvider.deleteOne(params) as Promise<
          DeleteOneResponse<TData>
        >;
      }
      if (resource === "roles") {
        return roleDataProvider.deleteOne(params) as Promise<
          DeleteOneResponse<TData>
        >;
      }
      console.warn(
        `deleteOne: No specific provider for resource '${resource}'. Using base provider.`
      );
      return baseDataProvider.deleteOne<TData, TVariables>(params);
    },

    deleteMany: <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: DeleteManyParams<TVariables>
    ): Promise<DeleteManyResponse<TData>> => {
      if (!baseDataProvider.deleteMany) {
        throw new Error("deleteMany not implemented by this data provider.");
      }
      return baseDataProvider.deleteMany<TData, TVariables>(params);
    },

    custom: <
      TData extends BaseRecord = BaseRecord,
      TQuery = unknown,
      TPayload = unknown
    >(
      params: CustomParams<TQuery, TPayload>
    ): Promise<CustomResponse<TData>> => {
      if (!baseDataProvider.custom) {
        throw new Error("Custom method not implemented in base data provider.");
      }
      return baseDataProvider.custom<TData, TQuery, TPayload>(params);
    },
  };
};
