import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const useAuthProvider = () => {
  const { logout, getIdTokenClaims, user, isAuthenticated } = useAuth0();

  const authProvider = {
    login: async () => {
      return {
        success: true,
      };
    },
    logout: async () => {
      // @ts-expect-error
      logout({ returnTo: window.location.origin });
      return {
        success: true,
      };
    },
    onError: async (error: any) => {
      console.error(error);
      return { error };
    },
    check: async () => {
      // return {
      //   authenticated: true,
      // };

      const path = window.location.pathname;

      if (path.startsWith("/forecast")) {
        return { authenticated: true };
      }

      try {
        const token = await getIdTokenClaims();
        if (token) {
          axios.defaults.headers.common = {
            Authorization: `Bearer ${token.__raw}`,
          };
          return {
            authenticated: true,
          };
        } else {
          return {
            authenticated: false,
            error: {
              message: "Check failed",
              name: "Token not found",
            },
            redirectTo: "/login",
            logout: true,
          };
        }
      } catch (error: any) {
        return {
          authenticated: false,
          error: new Error(error),
          redirectTo: "/login",
          logout: true,
        };
      }
    },
    getPermissions: async () => null,
    getIdentity: async () => {
      if (user) {
        const roles = user["https://myroles.com/roles"];
        return {
          ...user,
          roles,
          avatar: user.picture,
        };
      }
      return null;
    },
  };

  return authProvider;
};

export default useAuthProvider;
