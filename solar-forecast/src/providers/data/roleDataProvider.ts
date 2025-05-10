import { AxiosInstance } from "axios";
import {
  DataProvider,
  HttpError,
  GetListParams,
  GetListResponse,
  GetOneParams,
  GetOneResponse,
  CreateParams,
  CreateResponse,
  UpdateParams,
  UpdateResponse,
  DeleteOneParams,
  DeleteOneResponse,
  BaseRecord,
} from "@refinedev/core";
import {
  IRoleResponse,
  IPaginatedRoleResponse,
  UpdateRoleRequest,
} from "../../interfaces"; // Assuming interfaces are in src/interfaces/index.d.ts

/**
 * Creates a data provider specific to the /roles resource.
 */
export const createRoleDataProvider = (
  apiUrl: string,
  axiosInstance: AxiosInstance
): Pick<
  DataProvider,
  "getList" | "getOne" | "create" | "update" | "deleteOne"
> => {
  const resourceUrl = `${apiUrl}/roles`;

  return {
    /**
     * Fetches a paginated list of roles.
     */
    getList: async <TData extends BaseRecord = IRoleResponse>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> => {
      const { pagination, sorters, filters } = params;
      const current = pagination?.current ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      const page = current - 1; // 0-based index for backend

      const queryParams: any = {
        page: page,
        size: pageSize,
      };

      // Simple sorter implementation (adjust if backend uses different format)
      if (sorters && sorters.length > 0) {
        queryParams.sort = sorters
          .map((s) => `${s.field},${s.order}`)
          .join(",");
      }

      // Simple filter implementation (adjust based on backend)
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          if (
            "field" in filter &&
            "value" in filter &&
            filter.value !== "" &&
            filter.value != null
          ) {
            queryParams[filter.field] = filter.value;
          }
        });
      }

      try {
        const { data } = await axiosInstance.get<IPaginatedRoleResponse>(
          resourceUrl,
          { params: queryParams }
        );
        return {
          data: data.content as unknown as TData[],
          total: data.totalElements,
        };
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message || "Failed to fetch roles list",
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };
        throw httpError;
      }
    },

    /**
     * Fetches a single role by ID.
     */
    getOne: async <TData extends BaseRecord = IRoleResponse>(
      params: GetOneParams
    ): Promise<GetOneResponse<TData>> => {
      const { id } = params;
      try {
        const { data } = await axiosInstance.get<IRoleResponse>(
          `${resourceUrl}/${id}`
        );
        return {
          data: data as unknown as TData,
        };
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message || `Failed to fetch role with id: ${id}`,
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };
        throw httpError;
      }
    },

    /**
     * Creates a new role.
     * API expects { name: string, description: string }
     * API returns the created IRoleResponse.
     */
    create: async <
      TData extends BaseRecord = IRoleResponse,
      TVariables = { name: string; description: string }
    >(
      params: CreateParams<TVariables>
    ): Promise<CreateResponse<TData>> => {
      const { variables } = params;
      try {
        const { data } = await axiosInstance.post<IRoleResponse>(
          resourceUrl,
          variables
        );
        return {
          data: data as unknown as TData,
        };
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message || "Failed to create role",
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };
        throw httpError;
      }
    },

    /**
     * Updates an existing role.
     * API expects { name?: string, description?: string, permissions?: string[] }
     * API returns the updated IRoleResponse.
     */
    update: async <
      TData extends BaseRecord = IRoleResponse,
      TVariables = UpdateRoleRequest
    >(
      params: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> => {
      const { id, variables, meta } = params;

      try {
        const { data } = await axiosInstance.put<IRoleResponse>(
          `${resourceUrl}/${id}`,
          variables
        );
        return {
          data: data as unknown as TData,
        };
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message || `Failed to update role with id: ${id}`,
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };
        throw httpError;
      }
    },

    /**
     * Deletes a role by ID.
     * API expects DELETE request to /roles/{id}.
     * API returns 204 No Content on success.
     */
    deleteOne: async <
      TData extends BaseRecord = IRoleResponse, // Use IRoleResponse for consistency, though data might just be {id}
      TVariables = {}
    >(
      params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> => {
      const { id, variables } = params;
      try {
        // Delete doesn't usually have a request body, but pass variables if needed by backend
        await axiosInstance.delete(`${resourceUrl}/${id}`, { data: variables });
        // Return dummy data matching Refine's expectation
        return {
          data: { id } as unknown as TData,
        };
      } catch (error: any) {
        const httpError: HttpError = {
          message: error.message || `Failed to delete role with id: ${id}`,
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };
        throw httpError;
      }
    },
  };
};
