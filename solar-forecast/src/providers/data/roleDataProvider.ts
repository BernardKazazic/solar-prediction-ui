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
  RoleResponse,
  PaginatedRoleResponse,
  UpdateRoleRequest,
} from "../../interfaces"; // Assuming interfaces are in src/interfaces/index.d.ts

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
    async getList<TData extends BaseRecord = RoleResponse>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> {
      const { pagination, sorters, filters } = params;
      const current = pagination?.current ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      const page = current - 1; // 0-based index for backend

      const queryParams: any = {
        page: page,
        size: pageSize,
      };

      if (sorters && sorters.length > 0) {
        queryParams.sort = sorters
          .map((s) => `${s.field},${s.order}`)
          .join(",");
      }

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
        const { data } = await axiosInstance.get<PaginatedRoleResponse>(
          resourceUrl,
          { params: queryParams }
        );
        return {
          data: data.content as unknown as TData[],
          total: data.totalElements,
        };
      } catch (error: any) {
        throw formatError(error, "Failed to fetch roles list");
      }
    },

    /**
     * Fetches a single role by ID.
     */
    async getOne<TData extends BaseRecord = RoleResponse>(
      params: GetOneParams
    ): Promise<GetOneResponse<TData>> {
      const { id } = params;
      try {
        const { data } = await axiosInstance.get<RoleResponse>(
          `${resourceUrl}/${id}`
        );
        return {
          data: data as unknown as TData,
        };
      } catch (error: any) {
        throw formatError(error, `Failed to fetch role with id: ${id}`);
      }
    },

    /**
     * Creates a new role.
     * API expects { name: string, description: string }
     * API returns the created IRoleResponse.
     */
    async create<
      TData extends BaseRecord = RoleResponse,
      TVariables = { name: string; description: string }
    >(params: CreateParams<TVariables>): Promise<CreateResponse<TData>> {
      const { variables } = params;
      try {
        const { data } = await axiosInstance.post<RoleResponse>(
          resourceUrl,
          variables
        );
        return {
          data: data as unknown as TData,
        };
      } catch (error: any) {
        throw formatError(error, "Failed to create role");
      }
    },

    /**
     * Updates an existing role.
     * API expects { name?: string, description?: string, permissions?: string[] }
     * API returns the updated IRoleResponse.
     */
    async update<
      TData extends BaseRecord = RoleResponse,
      TVariables = UpdateRoleRequest
    >(params: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> {
      const { id, variables } = params;

      try {
        const { data } = await axiosInstance.put<RoleResponse>(
          `${resourceUrl}/${id}`,
          variables
        );
        return {
          data: data as unknown as TData,
        };
      } catch (error: any) {
        throw formatError(error, `Failed to update role with id: ${id}`);
      }
    },

    /**
     * Deletes a role by ID.
     * API expects DELETE request to /roles/{id}.
     * API returns 204 No Content on success.
     */
    async deleteOne<
      TData extends BaseRecord = RoleResponse, // Use IRoleResponse for consistency, though data might just be {id}
      TVariables = {}
    >(params: DeleteOneParams<TVariables>): Promise<DeleteOneResponse<TData>> {
      const { id, variables } = params;
      try {
        // Delete doesn't usually have a request body, but pass variables if needed by backend
        await axiosInstance.delete(`${resourceUrl}/${id}`, { data: variables });
        // Return dummy data matching Refine's expectation
        return {
          data: { id } as unknown as TData,
        };
      } catch (error: any) {
        throw formatError(error, `Failed to delete role with id: ${id}`);
      }
    },
  };
};
