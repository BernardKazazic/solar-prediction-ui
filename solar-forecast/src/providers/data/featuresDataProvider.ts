import { AxiosInstance } from "axios";
import {
  DataProvider,
  BaseRecord,
  GetListParams,
  GetListResponse,
} from "@refinedev/core";
import { FeaturesResponse } from "../../interfaces";

export const createFeaturesDataProvider = (
  apiUrl: string,
  axiosInstance: AxiosInstance
): Pick<DataProvider, "getList"> => {
  return {
    async getList<TData extends BaseRecord = any>(
      params: GetListParams
    ): Promise<GetListResponse<TData>> {
      const { data } = await axiosInstance.get<FeaturesResponse>(
        `${apiUrl}/features`
      );

      // Transform the features array into objects with id and name for Refine compatibility
      const transformedFeatures = data.features.map((feature, index) => ({
        id: index + 1,
        name: feature,
        value: feature,
      }));

      return {
        data: transformedFeatures as unknown as TData[],
        total: data.features.length,
      };
    },
  };
}; 