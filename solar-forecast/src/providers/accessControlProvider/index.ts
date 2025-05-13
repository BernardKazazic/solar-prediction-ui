import { CanParams, CanResponse } from "@refinedev/core";
import useAuthProvider from "../authProvider";

const permissionMap: Record<string, Record<string, string>> = {
  users: {
    list: "user:read",
    show: "user:read",
    create: "user:create",
    edit: "user:update",
    delete: "user:delete",
  },
  roles: {
    list: "role:read",
    show: "role:read",
    create: "role:create",
    edit: "role:update",
    delete: "role:delete",
  },
  permissions: {
    list: "permission:read",
    show: "permission:read",
    update: "permission:update",
  },
};

const useAccessControlProvider = () => {
  const authProvider = useAuthProvider();

  return {
    can: async ({ resource, action }: CanParams): Promise<CanResponse> => {
      const identity = await authProvider.getIdentity();
      const permissions = identity?.permissions || [];

      const resourceKey = resource || "";
      const actionKey = action || "";
      const requiredPermission = permissionMap[resourceKey]?.[actionKey];
      if (requiredPermission) {
        return { can: permissions.includes(requiredPermission) };
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
};

export default useAccessControlProvider;
