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
  UpdateParams,
  UpdateResponse,
} from "@refinedev/core";
import {
  UserResponse,
  PaginatedUserResponse,
  CreateUserTicketResponse,
  UpdateUserRequest,
} from "../../interfaces";

function formatError(error: any): HttpError {
  const httpError: HttpError = {
    message: error?.response?.data?.message || error.message || "Unknown error",
    statusCode: error?.response?.status || 500,
  };
  if (error?.response?.data?.errors) {
    httpError.errors = error.response.data.errors;
  }
  return httpError;
}

export const createUserDataProvider = (
  apiUrl: string,
  axiosInstance: AxiosInstance
): Pick<
  DataProvider,
  "getList" | "getOne" | "create" | "deleteOne" | "update"
> => {
  return {
    /**
     * Fetches a paginated list of users.
     */
    async getList<TData extends BaseRecord = UserResponse>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> {
      const { pagination } = params;
      const current = pagination?.current ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      const page = current - 1;
      const queryParams = { page, size: pageSize };
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
        throw formatError(error);
      }
    },

    /**
     * Fetches a single user by id.
     */
    async getOne<TData extends BaseRecord = UserResponse>(
      params: GetOneParams
    ): Promise<GetOneResponse<TData>> {
      const { id } = params;
      const url = `${apiUrl}/users/${id}`;
      try {
        const { data } = await axiosInstance.get<UserResponse>(url);
        return {
          data: data as unknown as TData,
        };
      } catch (error: any) {
        throw formatError(error);
      }
    },

    /**
     * Deletes a user by id.
     */
    async deleteOne<TData extends BaseRecord = UserResponse, TVariables = {}>(
      params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> {
      const { id, variables } = params;
      const url = `${apiUrl}/users/${id}`;
      try {
        await axiosInstance.delete(url, { data: variables });
        return {
          data: { id } as TData,
        };
      } catch (error: any) {
        throw formatError(error);
      }
    },

    /**
     * Creates a new user.
     */
    async create<
      TData extends BaseRecord = CreateUserTicketResponse,
      TVariables = {}
    >(params: CreateParams<TVariables>): Promise<CreateResponse<TData>> {
      const { variables } = params;
      const url = `${apiUrl}/users`;
      try {
        const { data } = await axiosInstance.post<CreateUserTicketResponse>(
          url,
          variables
        );
        return {
          data: data as unknown as TData,
        };
      } catch (error: any) {
        throw formatError(error);
      }
    },

    /**
     * Updates a user by id.
     */
    async update<TData extends BaseRecord = UserResponse, TVariables = {}>(
      params: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> {
      const { id, variables } = params;
      const url = `${apiUrl}/users/${id}`;
      try {
        const { data } = await axiosInstance.put<UserResponse>(
          url,
          variables as UpdateUserRequest
        );
        return {
          data: data as unknown as TData,
        };
      } catch (error: any) {
        throw formatError(error);
      }
    },
  };
};
