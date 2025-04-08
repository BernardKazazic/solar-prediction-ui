import { AxiosInstance } from "axios";
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
} from "@refinedev/core";
import {
  UserResponse,
  PaginatedUserResponse,
  CreateUserTicketResponse,
} from "../../interfaces";

export const createUserDataProvider = (
  apiUrl: string,
  axiosInstance: AxiosInstance
): Pick<DataProvider, "getList" | "getOne" | "create" | "deleteOne"> => {
  return {
    getList: async <TData extends BaseRecord = UserResponse>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> => {
      const { pagination } = params;
      const current = pagination?.current ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      const page = current - 1; // 0-based index is on backend

      const queryParams: any = {
        page: page,
        size: pageSize,
      };

      const url = `${apiUrl}/users`;

      try {
        const { data } = await axiosInstance.get<PaginatedUserResponse>(url, {
          params: queryParams,
        });

        return {
          data: data.content as unknown as TData[],
          total: data.totalElements,
        };
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message,
          statusCode: error.response?.status || 500,
        };
        throw httpError;
      }
    },

    getOne: async <TData extends BaseRecord = UserResponse>(
      params: GetOneParams
    ): Promise<GetOneResponse<TData>> => {
      const { id } = params;
      const url = `${apiUrl}/users/${id}`;
      try {
        const { data } = await axiosInstance.get<UserResponse>(url);
        return {
          data: data as unknown as TData,
        };
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message,
          statusCode: error.response?.status || 500,
        };
        throw httpError;
      }
    },

    deleteOne: async <TData extends BaseRecord = UserResponse, TVariables = {}>(
      params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> => {
      const { id, variables } = params;
      const url = `${apiUrl}/users/${id}`;
      try {
        await axiosInstance.delete(url, { data: variables });
        return {
          data: { id } as TData,
        };
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message,
          statusCode: error.response?.status || 500,
        };
        throw httpError;
      }
    },

    create: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: CreateParams<TVariables>
    ): Promise<CreateResponse<TData>> => {
      const { variables } = params;
      const url = `${apiUrl}/users`;
      try {
        const { data } = await axiosInstance.post<CreateUserTicketResponse>(
          url,
          variables
        );
        return {
          data: data,
        } as any;
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message,
          statusCode: error.response?.status || 500,
        };
        if (error.response?.data) {
          if (
            typeof error.response.data === "object" &&
            error.response.data.errors
          ) {
            httpError.errors = error.response.data.errors;
          } else if (typeof error.response.data === "string") {
            httpError.message = error.response.data;
          }
        }
        throw httpError;
      }
    },
  };
};
