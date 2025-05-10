import { AxiosInstance } from "axios";
import {
  DataProvider,
  HttpError,
  GetListParams,
  GetListResponse,
  UpdateParams,
  UpdateResponse, // We need UpdateResponse
  BaseRecord,
} from "@refinedev/core";
import {
  IPermissionResponse,
  IPaginatedPermissionResponse,
  IUpdatePermissionsRequest,
} from "../../interfaces"; // Assuming interfaces are in src/interfaces/index.d.ts

/**
 * Creates a data provider specific to the /permissions resource.
 */
export const createPermissionDataProvider = (
  apiUrl: string,
  axiosInstance: AxiosInstance
): Pick<DataProvider, "getList" | "update"> => {
  // Note: getList for permissions usually fetches ALL permissions (no pagination needed in practice for the UI)
  // The backend might still return it paginated, so we handle that.
  const resourceUrl = `${apiUrl}/permissions`;

  return {
    /**
     * Fetches the list of all permissions.
     */
    getList: async <TData extends BaseRecord = IPermissionResponse>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> => {
      // Even if UI doesn't paginate, respect potential backend pagination if needed
      const { pagination } = params; // We don't need sorters/filters typically for all permissions
      const current = pagination?.current ?? 1;
      const pageSize = pagination?.pageSize ?? 1000; // Fetch a large number if pagination is off
      const page = current - 1;

      const queryParams: any = {
        // Send pagination params if backend expects them, otherwise remove
        // page: page,
        // size: pageSize,
      };

      try {
        // Assuming the backend returns IPaginatedPermissionResponse even if requesting all
        const { data } = await axiosInstance.get<IPaginatedPermissionResponse>(
          resourceUrl,
          { params: queryParams }
        );
        return {
          data: data.content as unknown as TData[],
          total: data.totalElements,
        };
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message || "Failed to fetch permissions list",
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };
        throw httpError;
      }
    },

    /**
     * Updates the entire set of permissions.
     * API expects PUT /permissions with body { permissions: [{ permissionName, description }, ...] }
     * API returns 204 No Content on success.
     */
    update: async <
      TData extends BaseRecord = BaseRecord, // No specific data returned on success
      TVariables = IUpdatePermissionsRequest
    >(
      params: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> => {
      // Note: UpdateParams usually has an `id`, but PUT /permissions doesn't.
      // We ignore the `id` if passed by Refine hooks (like useForm calling update).
      const { variables } = params;
      try {
        // Make the PUT request to the resource base URL
        await axiosInstance.put(resourceUrl, variables);
        // Return a successful response structure Refine expects for updates,
        // even though the API returns 204. Use dummy data.
        return {
          data: { id: "permissions" } as unknown as TData, // Dummy data
        };
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message || "Failed to update permissions",
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };
        throw httpError;
      }
    },
  };
};
