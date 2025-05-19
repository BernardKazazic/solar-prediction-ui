import { AxiosInstance } from "axios";
import {
  DataProvider,
  BaseRecord,
  CreateParams,
  CreateResponse,
} from "@refinedev/core";

export const createModelDataProvider = (
  apiUrl: string,
  axiosInstance: AxiosInstance
): Pick<DataProvider, "create"> => {
  return {
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
  };
} 