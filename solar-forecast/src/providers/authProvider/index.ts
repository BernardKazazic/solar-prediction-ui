import { useAuth0, User } from "@auth0/auth0-react";
import axios from "axios";

const useAuthProvider = () => {
  const { logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();

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
        return {
          authenticated: false,
          error: new Error(error.message || "Authentication check failed"),
          redirectTo: "/login",
          logout: true,
        };
      }
    },
    getPermissions: async () => {
      try {
        const token = await getAccessTokenSilently();
        const payload = token.split(".")[1];
        if (!payload) return null;
        const decodedToken = JSON.parse(atob(payload));
        return decodedToken.permissions || [];
      } catch (error) {
        console.error("Error getting permissions:", error);
        return []; // Return empty array on error
      }
    },
    getIdentity: async () => {
      if (user) {
        const permissions = await authProvider.getPermissions();

        return {
          ...user,
          id: user.sub,
          name: user.name,
          avatar: user.picture,
          permissions: permissions,
        };
      }
      return null;
    },
    getAccessToken: async () => {
      try {
        const token = await getAccessTokenSilently();
        return token;
      } catch (error) {
        console.error("Error getting access token:", error);
        // Maybe trigger logout if returning null wont be ok in the future
        return null;
      }
    },
  };

  return authProvider;
};

export default useAuthProvider;
