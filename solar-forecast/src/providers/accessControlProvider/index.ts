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
      // Fetch user identity including permissions
      const identity = await authProvider.getIdentity();
      const permissions = identity?.permissions || []; // Get permissions from identity

      // Helper function to check for a specific permission
      const hasPermission = (permission: string) =>
        permissions.includes(permission);

      // --- Access logic based on PERMISSIONS ---

      if (resource === "users") {
        // Check permissions for specific actions on the 'users' resource
        switch (action) {
          case "list":
          case "show":
            return { can: hasPermission("user:read") };
          case "create":
            return { can: hasPermission("user:create") };
          case "edit": // Add edit if you implement it later
            // return { can: hasPermission("user:update") }; // Example
            return { can: false, reason: "Edit action not configured" };
          case "delete":
            return { can: hasPermission("user:delete") };
          default:
            // Deny any other actions on 'users' resource
            return { can: false, reason: `Unknown action: ${action}` };
        }
      }

      // --- Logic for other resources ---
      // For simplicity, allow all actions if the user has any permissions
      // You might want more granular checks here based on specific permissions
      // for other resources (e.g., "plant:read", "plant:create")
      if (permissions.length > 0) {
        return { can: true };
      }

      // Deny access to everything else if no permissions found
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
