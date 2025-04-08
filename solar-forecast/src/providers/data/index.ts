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
import dataProvider from "@refinedev/simple-rest";
import { AuthProvider } from "@refinedev/core";
import { createUserDataProvider } from "./userDataProvider";

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

  const baseDataProvider = dataProvider(apiUrl, axiosInstance);
  const userDataProvider = createUserDataProvider(apiUrl, axiosInstance);

  return {
    getApiUrl: baseDataProvider.getApiUrl,

    getList: async (params: GetListParams) => {
      const { resource } = params;
      if (resource === "users") {
        return userDataProvider.getList(params);
      }
      return baseDataProvider.getList(params);
    },

    getMany: async <TData extends BaseRecord = BaseRecord>(
      params: GetManyParams
    ): Promise<GetManyResponse<TData>> => {
      if (baseDataProvider.getMany) {
        return baseDataProvider.getMany<TData>(params);
      }
      throw new Error("getMany not implemented by base data provider.");
    },

    getOne: async (params: GetOneParams) => {
      const { resource } = params;
      if (resource === "users") {
        return userDataProvider.getOne(params);
      }
      return baseDataProvider.getOne(params);
    },

    create: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: CreateParams<TVariables>
    ): Promise<CreateResponse<TData>> => {
      const { resource } = params;
      if (resource === "users") {
        return (userDataProvider.create as Function)(params);
      }
      return baseDataProvider.create<TData, TVariables>(params);
    },

    createMany: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: CreateManyParams<TVariables>
    ): Promise<CreateManyResponse<TData>> => {
      throw new Error("createMany not implemented by this data provider.");
    },

    update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> => {
      const { resource } = params;
      return baseDataProvider.update<TData, TVariables>(params);
    },

    updateMany: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: UpdateManyParams<TVariables>
    ): Promise<UpdateManyResponse<TData>> => {
      throw new Error("updateMany not implemented by this data provider.");
    },

    deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> => {
      const { resource } = params;
      if (resource === "users") {
        return (userDataProvider.deleteOne as Function)(params);
      }
      return baseDataProvider.deleteOne<TData, TVariables>(params);
    },

    deleteMany: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: DeleteManyParams<TVariables>
    ): Promise<DeleteManyResponse<TData>> => {
      throw new Error("deleteMany not implemented by this data provider.");
    },

    custom: async <
      TData extends BaseRecord = BaseRecord,
      TQuery = unknown,
      TPayload = unknown
    >(
      params: CustomParams<TQuery, TPayload>
    ): Promise<CustomResponse<TData>> => {
      if (baseDataProvider.custom) {
        return baseDataProvider.custom<TData, TQuery, TPayload>(params);
      }
      throw new Error("Custom method not implemented in base data provider.");
    },
  };
};
