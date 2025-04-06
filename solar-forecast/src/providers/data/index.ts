import axios, { AxiosInstance } from "axios";
import {
  DataProvider,
  HttpError,
  GetListParams,
  GetListResponse,
  BaseRecord,
} from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";
import { AuthProvider } from "@refinedev/core"; // Assuming AuthProvider type is available

// Define types based on your API responses
interface UserResponse extends BaseRecord {
  userId: string;
  email: string;
  name: string;
  picture: string;
  lastLogin: string;
  roles: string[];
}

interface PaginatedUserResponse {
  content: UserResponse[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

// Function to create the data provider
export const createDataProvider = (
  apiUrl: string,
  authProvider: AuthProvider & { getAccessToken?: () => Promise<string | null> }
): DataProvider => {
  const axiosInstance: AxiosInstance = axios.create();

  // Add request interceptor
  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = await authProvider.getAccessToken?.();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      // You might want to add specific error handling here
      // For example, if getting the token fails, redirect to login
      const httpError: HttpError = {
        message: error.message,
        statusCode: error.response?.status || 500,
      };
      return Promise.reject(httpError);
    }
  );

  // Initialize the simple-rest provider with the base URL and axios instance
  const baseDataProvider = dataProvider(apiUrl, axiosInstance);

  // Return a custom provider that overrides getList
  return {
    ...baseDataProvider,
    getList: async <TData extends BaseRecord = BaseRecord>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> => {
      const { resource, pagination, sorters, filters } = params;

      // Apply custom logic ONLY for the 'users' resource
      if (resource === "users") {
        const current = pagination?.current ?? 1;
        const pageSize = pagination?.pageSize ?? 10;
        const page = current - 1; // 0-based index for backend

        const queryParams: any = {
          page: page,
          size: pageSize,
          // TODO: Map sorters and filters if needed for the 'users' endpoint
          // Example: sort: sorters?.map(s => `${s.field},${s.order}`).join(','),
        };

        const url = `${apiUrl}/${resource}`;

        try {
          // Make the axios call expect the specific PaginatedUserResponse structure
          const { data } = await axiosInstance.get<PaginatedUserResponse>(url, {
            params: queryParams,
          });

          // Cast the result back to GetListResponse<TData>
          return {
            data: data.content as unknown as TData[], // Cast via unknown
            total: data.totalElements,
          };
        } catch (error: any) {
          const httpError: HttpError = {
            message: error.message,
            statusCode: error.response?.status || 500,
          };
          throw httpError;
        }
      }

      // For all other resources, fall back to the base provider's getList
      return baseDataProvider.getList<TData>(params);
    },
    // Add getOne customization if needed (simple-rest expects ID in URL)
    getOne: async ({ resource, id, meta }) => {
      // If your API uses userId instead of id in the URL for getOne
      if (resource === "users") {
        const url = `${apiUrl}/${resource}/${id}`; // Assuming backend uses the ID passed
        try {
          const { data } = await axiosInstance.get<UserResponse>(url);
          return {
            data: data as any, // Cast if necessary, ensure compatibility with BaseRecord
          };
        } catch (error: any) {
          const httpError: HttpError = {
            message: error.message,
            statusCode: error.response?.status || 500,
          };
          throw httpError;
        }
      }
      // Fallback for other resources
      return baseDataProvider.getOne({ resource, id, meta });
    },
    // Add deleteOne customization if needed (simple-rest expects ID in URL)
    deleteOne: async ({ resource, id, variables, meta }) => {
      // If your API uses userId instead of id in the URL for delete
      if (resource === "users") {
        const url = `${apiUrl}/${resource}/${id}`; // Assuming backend uses the ID passed
        try {
          const { data } = await axiosInstance.delete<UserResponse>(url, {
            data: variables,
          });
          return {
            data: data as any, // Cast if necessary
          };
        } catch (error: any) {
          const httpError: HttpError = {
            message: error.message,
            statusCode: error.response?.status || 500,
          };
          throw httpError;
        }
      }
      // Fallback for other resources
      return baseDataProvider.deleteOne({ resource, id, variables, meta });
    },
    // Add create customization if your API expects a different body or returns differently
    create: async ({ resource, variables, meta }) => {
      if (resource === "users") {
        const url = `${apiUrl}/${resource}`;
        try {
          // Expect a plain string (temporary password) response
          const { data: temporaryPassword } = await axiosInstance.post<string>(
            url,
            variables
          );
          // Return the password wrapped in a specific structure for the hook
          return {
            data: { temporaryPassword: temporaryPassword } as any, // Cast as any to fit DataProvider structure
          };
        } catch (error: any) {
          const httpError: HttpError = {
            message: error.message,
            statusCode: error.response?.status || 500,
          };
          // You might want to parse backend validation errors here if available
          if (error.response?.data) {
            // Check if errors are provided in a specific format
            if (typeof error.response.data === 'object' && error.response.data.errors) {
               httpError.errors = error.response.data.errors;
            } else if (typeof error.response.data === 'string') {
              // If the error is just a string message
              httpError.message = error.response.data;
            }
          }
          throw httpError;
        }
      }
      // Fallback for other resources
      return baseDataProvider.create({ resource, variables, meta });
    },
    // You might need to customize other methods (update) similarly
  };
};
