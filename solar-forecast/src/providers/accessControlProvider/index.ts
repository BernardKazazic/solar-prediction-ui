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
      const identity = await authProvider.getIdentity();
      const permissions = identity?.permissions || [];
      const hasPermission = (permission: string) =>
        permissions.includes(permission);

      if (resource === "users") {
        switch (action) {
          case "list":
          case "show":
            return { can: hasPermission("user:read") };
          case "create":
            return { can: hasPermission("user:create") };
          case "edit":
            return { can: hasPermission("user:update") };
          case "delete":
            return { can: hasPermission("user:delete") };
          default:
            return { can: false, reason: `Unknown action: ${action}` };
        }
      }

      if (permissions.length > 0) {
        return { can: true };
      }

      return { can: false, reason: "No permissions found" };
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
