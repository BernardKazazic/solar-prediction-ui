import { CanParams, CanResponse, CanReturnType } from "@refinedev/core";
import useAuthProvider from "../authProvider";

export interface IAccessControlContext {
  can?: ({ resource, action, params }: CanParams) => Promise<CanResponse>;
  options?: {
    buttons?: {
      enableAccessControl?: boolean;
      hideIfUnauthorized?: boolean;
    };
  };
}

const useAccessControlProvider = () => {
  const authProvider = useAuthProvider();

  const accessControlProvider: IAccessControlContext = {
    can: async ({
      resource,
      action,
      params,
    }: CanParams): Promise<CanResponse> => {
      if (!resource) {
        return { can: false, reason: "Resource is undefined" };
      }
      const identity = await authProvider.getIdentity();
      const roles = identity?.roles || [];

      if (roles?.includes("admin") || roles?.includes("editor")) {
        return { can: true };
      }

      const restrictedActions = ["edit", "delete", "create"];
      const restrictedResources = ["users"];

      if (
        restrictedActions.includes(action) ||
        restrictedResources.includes(resource)
      ) {
        return { can: false, reason: "Unauthorized" };
      }

      return { can: true };
    },

    options: {
      buttons: {
        enableAccessControl: true,
        hideIfUnauthorized: true,
      },
    },
  };

  return accessControlProvider;
};

export default useAccessControlProvider;
