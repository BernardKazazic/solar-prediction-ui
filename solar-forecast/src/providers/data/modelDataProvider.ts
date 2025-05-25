import { AxiosInstance } from "axios";
import {
  DataProvider,
  BaseRecord,
  CreateParams,
  CreateResponse,
  GetListParams,
  GetListResponse,
  GetOneParams,
  GetOneResponse,
  UpdateParams,
  UpdateResponse,
} from "@refinedev/core";
import { PaginatedModelsResponse, UpdateModelRequest } from "../../interfaces";

export const createModelDataProvider = (
  apiUrl: string,
  axiosInstance: AxiosInstance
): Pick<DataProvider, "create" | "getList" | "getOne" | "update"> => {
  return {
    async getList<TData extends BaseRecord = any>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> {
      const { pagination, sorters, filters } = params;
      
      const query: Record<string, any> = {};
      
      if (pagination) {
        query.page = pagination.current;
        query.page_size = pagination.pageSize;
      }
      
      // Handle filters if needed
      if (filters) {
        filters.forEach((filter) => {
          if (filter.operator === "eq" && filter.value) {
            query[filter.field] = filter.value;
          }
        });
      }
      
      // Handle sorters if needed
      if (sorters && sorters.length > 0) {
        const sorter = sorters[0];
        query.sort_by = sorter.field;
        query.sort_order = sorter.order;
      }

      const { data } = await axiosInstance.get<PaginatedModelsResponse>(
        `${apiUrl}/models`,
        { params: query }
      );

      return {
        data: data.models as unknown as TData[],
        total: data.total_count,
      };
    },

    async getOne<TData extends BaseRecord = any>(
      params: GetOneParams
    ): Promise<GetOneResponse<TData>> {
      const { id } = params;
      
      const { data } = await axiosInstance.get(
        `${apiUrl}/models/${id}`
      );

      return {
        data: data as TData,
      };
    },

    async create<TData extends BaseRecord = any, TVariables = {}>(
      params: CreateParams<TVariables>
    ): Promise<CreateResponse<TData>> {
      
      const { variables } = params;
      const formData = new FormData();

      Object.entries(variables as Record<string, any>).forEach(([key, value]) => {
        if (key === "fileList" && Array.isArray(value) && value[0]?.originFileObj) {
          formData.append("file", value[0].originFileObj);
        } else if (key === "parameters") {
          formData.append("features", JSON.stringify(value));
        } else if (key !== "fileList") {
          formData.append(key, value);
        }
      });

      const { data } = await axiosInstance.post(`${apiUrl}/models`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { data: data as TData };
    },

    async update<TData extends BaseRecord = any, TVariables = {}>(
      params: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> {
      const { id, variables } = params;
      
      const updateData: UpdateModelRequest = {
        features: (variables as any).features || [],
      };

      const { data } = await axiosInstance.put(
        `${apiUrl}/models/${id}`,
        updateData
      );

      return {
        data: data as TData,
      };
    },
  };
} 