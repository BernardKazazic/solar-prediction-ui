import { useAuth0, User } from "@auth0/auth0-react";
import axios from "axios";

const useAuthProvider = () => {
  const {
    logout,
    getIdTokenClaims,
    user,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();

  const authProvider = {
    login: async () => {
      return {
        success: true,
      };
    },
    logout: async () => {
      logout({ logoutParams: { returnTo: window.location.origin } });
      return {
        success: true,
      };
    },
    onError: async (error: any) => {
      console.error(error);
      return { error };
    },
    check: async () => {
      const path = window.location.pathname;

      if (path.startsWith("/forecast")) {
        return { authenticated: true };
      }

      try {
        // Check authentication status via isAuthenticated or try getting token
        const token = await getAccessTokenSilently();
        if (isAuthenticated && token) {
          return {
            authenticated: true,
          };
        } else {
          return {
            authenticated: false,
            error: {
              message: "Check failed",
              name: "User not authenticated",
            },
            redirectTo: "/login",
            logout: true,
          };
        }
      } catch (error: any) {
        // Handle specific errors like 'login_required' if needed
        return {
          authenticated: false,
          error: new Error(error.message || "Authentication check failed"),
          redirectTo: "/login",
          logout: true,
        };
      }
    },
    getPermissions: async () => {
      // Attempt to get permissions from the access token if configured in Auth0
      try {
        const token = await getAccessTokenSilently();
        const payload = token.split(".")[1];
        if (!payload) return null;
        const decodedToken = JSON.parse(atob(payload)); // Basic JWT decode
        return decodedToken.permissions || []; // Assuming permissions are in the token payload, default to empty array
      } catch (error) {
        console.error("Error getting permissions:", error);
        return []; // Return empty array on error
      }
    },
    getIdentity: async () => {
      if (user) {
        // Get permissions using the existing logic
        const permissions = await authProvider.getPermissions();

        return {
          ...user,
          id: user.sub, // Use 'sub' as the standard user ID
          name: user.name,
          avatar: user.picture,
          permissions: permissions, // Include permissions
        };
      }
      return null;
    },
    // Add getAccessToken method
    getAccessToken: async () => {
      try {
        const token = await getAccessTokenSilently();
        return token;
      } catch (error) {
        console.error("Error getting access token:", error);
        // Handle error appropriately, maybe trigger logout or return null
        return null;
      }
    },
  };

  return authProvider;
};

export default useAuthProvider;
