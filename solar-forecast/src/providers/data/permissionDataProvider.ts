import { AxiosInstance } from "axios";
import {
  DataProvider,
  HttpError,
  GetListParams,
  GetListResponse,
  UpdateParams,
  UpdateResponse,
  BaseRecord,
} from "@refinedev/core";
import {
  PermissionResponse,
  PaginatedPermissionResponse,
  UpdatePermissionsRequest,
} from "../../interfaces";

/**
 * Formats error objects consistently for all provider methods.
 */
function formatError(error: any, fallbackMessage: string): HttpError {
  return {
    message: error?.response?.data?.message || error.message || fallbackMessage,
    statusCode: error?.response?.status || 500,
    errors: error?.response?.data?.errors,
  };
}

/**
 * Data provider for the /permissions resource.
 * Supports listing and updating permissions.
 */
export const createPermissionDataProvider = (
  apiUrl: string,
  axiosInstance: AxiosInstance
): Pick<DataProvider, "getList" | "update"> => {
  const resourceUrl = `${apiUrl}/permissions`;

  return {
    /**
     * Fetches all permissions. Respects backend pagination if present.
     */
    async getList<TData extends BaseRecord = PermissionResponse>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> {
      try {
        const { data } = await axiosInstance.get<PaginatedPermissionResponse>(
          resourceUrl
        );
        return {
          data: data.content as unknown as TData[],
          total: data.totalElements,
        };
      } catch (error: any) {
        throw formatError(error, "Failed to fetch permissions list");
      }
    },

    /**
     * Updates the entire set of permissions.
     * Returns a dummy object with id 'permissions' for Refine compatibility.
     */
    async update<
      TData extends BaseRecord = BaseRecord,
      TVariables = UpdatePermissionsRequest
    >(params: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> {
      const { variables } = params;
      try {
        await axiosInstance.put(resourceUrl, variables);
        return {
          data: { id: "permissions" } as unknown as TData,
        };
      } catch (error: any) {
        throw formatError(error, "Failed to update permissions");
      }
    },
  };
};
