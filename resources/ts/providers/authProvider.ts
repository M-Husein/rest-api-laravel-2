import { AuthProvider } from "@refinedev/core";
import { api, httpRequest, retryOnServerErrors } from '@/providers/dataProvider';
import { toggleLoaderApp } from '@/utils/dom';
import { getUser, updateUser, clearUser, getAvatarUrl } from '@/utils/user';
import { getMeta } from '@/utils/browser';
import { featureApi } from '@/core/feature';

// const setLang = (lang: string): void => {
//   localStorage.setItem("i18nextLng", lang);
//   document.documentElement.lang = lang;
//   i18n.changeLanguage(lang);
// }

let authCheckPromise: Promise<any> | null | undefined;

const isAdminZone = () => window.location.pathname.startsWith('/app');

/**
 * Public routes (/login, /403, ...) live in a separate router/bundle.
 * From the admin zone we must leave the SPA and hard-reload into it.
 */
const publicRedirect = (path: string): { redirectTo?: string } => {
  if (isAdminZone()) {
    window.location.replace(path);
    return {};
  }
  return { redirectTo: path };
};

export const authProvider: AuthProvider = {
  register: async ({ ...json }) => {
    const errorResponse = {
      success: false,
      error: {
        name: "RegisterError",
        message: featureApi.translate('error.register'),
      },
    };

    try {
      const response: any = await httpRequest.post('register', {
        json 
      }).json();

      // console.log('register response:', response);

      if(response?.success){
        return {
          success: true,
          redirectTo: '/',
          successNotification: {
            message: response.message || featureApi.translate('notifs.checkVerificationEmail'),
            description: featureApi.translate('notifs.registerSuccess'),
          },
          user: response.data?.user, // <- Custom
        };
      }

      return errorResponse;
    } catch(err: any) {
      // console.log('err:', err);
      if(err?.message){
        errorResponse.error.message = err.message;
      }
      return errorResponse;
    }
  },
  
  /** @OPTIONS : email, username, provider | providerName */
  // { identifier, password, remember }
  login: async (payload) => {
    const errorResponse: any = {
      success: false,
      error: {
        name: "LoginError",
        message: featureApi.translate('error.login'),
      },
    };

    try {
      const uaData = (navigator as any).userAgentData;
      if(uaData){
        payload.uad = uaData.toJSON();
      }

      const response: any = await httpRequest.post('login', {
        json: payload
      }).json();

      // console.log('login response:', response);

      if(response?.success){
        updateUser({ 
          ...response.data, 
          avatar: getAvatarUrl(response.data.avatar),
        });

        /**
         * The Telemetry Path: Fire-and-forget (Notice there is NO `await` here)
         * We wrap it in an IIFE (Immediately Invoked Function Expression) to run asynchronously
         */
        (async () => {
          try {
            const fullMeta = await getMeta();
            
            // We await this INSIDE the un-awaited IIFE. 
            // This allows the try/catch to work without blocking main login redirect!
            await httpRequest.post("setup", { 
              json: { meta: fullMeta }, 
              keepalive: true 
            });
          } catch {
            // Fails completely silently if blocked by privacy extensions or network drops.
            // If the network drops or an adblocker kills the request, it fails silently.
          }
        })();

        // window.location.replace('/');
        // window.location.reload();
        
        return {
          success: true,
          redirectTo: "/" // "/app", // For admin
        };
      }

      return errorResponse;
    }catch(err: any) {
      // console.log('err:', err);
      if(err?.message){
        errorResponse.error.message = err.message;
      }
      return errorResponse;
      // throw errorResponse;
    }
  },

  logout: async () => { // params: any
    // const errorResponse = {
    //   success: false,
    //   error: {
    //     name: "LogoutError",
    //     message: featureApi.translate('error.logout'),
    //   },
    // };

    /**
     * @OPTION :  to prevent request endpoint if no user data
     */
    if(!getUser()){
      return { success: true };
    }

    toggleLoaderApp(false);

    try {
      /** @OPTION : make sure logout api success */
      // , { keepalive: true}
      // const response: any = await httpRequest.post('logout').json();
      // console.log('response:', response);

      // if(response?.success){
      //   clearUser(); // Clear data

      //   const bc = new BroadcastChannel(import.meta.env.VITE_BC_NAME);
      //   bc.postMessage({ type: "LOGOUT" });

      //   // // Reset to default lang
      //   // setLang(APP.defaultLang);

      //   // window.location.replace('/login');

      //   return {
      //     success: true,
      //     redirectTo: '/login',
      //   };
      // }

      // return errorResponse;

      /**
       * It doesn't have to be successful
       */
      await httpRequest.post('logout', { keepalive: true }).json();

      clearUser(); // Clear data
      featureApi.clearLocale(); // Reset the active locale strategy's stored value

      const bc = new BroadcastChannel(import.meta.env.VITE_BC_NAME);
      bc.postMessage({ type: "LOGOUT" });
      // window.location.replace('/login');

      return {
        success: true,
        ...publicRedirect('/login'),
      };

    } catch(err: any) {
      const status = err?.response?.status ?? err?.statusCode;

      // 401 = session expired or not logged in
      if (status === 401) {
        // window.location.replace('/login');
        clearUser();
        featureApi.clearLocale();
        return {
          success: true,
          ...publicRedirect('/login'),
        };
      }

      return {
        success: false,
        error: {
          name: "LogoutError",
          message: err?.message || featureApi.translate('error.logout'),
        },
      }
    } finally {
      toggleLoaderApp(true);
    }
  },
  
  check: async () => {
    // If a check is already in progress, return that same promise
    if (authCheckPromise) return authCheckPromise;

    // From blade / server rendering
    let initUser = getUser();

    if(initUser == null){
      return { authenticated: false };
    }

    if(initUser){
      initUser = {
        ...initUser,
        avatar: getAvatarUrl(initUser.avatar),
        authenticated: true
      };
      updateUser(initUser);
      return initUser;
    }

    // Request API
    authCheckPromise = (async () => {
      try {
        const response: any = await httpRequest('me', { retry: retryOnServerErrors }).json();
        // console.log('check response:', response);

        if(response?.success){
          const user = { 
            ...response.data, 
            avatar: getAvatarUrl(response.data.avatar),
            authenticated: true
          };

          updateUser(user);
          
          return user;
        }

        clearUser(); // Clear data

        return {
          authenticated: false,
          logout: true,
          ...publicRedirect('/login'),
          error: {
            name: "Unauthorized",
            message: response?.message || featureApi.translate('error.check'),
          },
        };
      } catch(err: any) {
        /**
         * Try to extract the status from the error.
         * Common patterns:
         * - error.response?.status (from fetch/ky)
         * - error.statusCode (from some providers)
         * - error.status (from axios)
         */
        const status = err?.response?.status ?? err?.statusCode; // ?? err?.status;

        // 401 = session expired or not logged in
        if (status === 401) {
          clearUser(); // Clear data

          return {
            authenticated: false,
            ...publicRedirect('/login'),
            logout: true,
            error: {
              name: 'SessionExpired',
              message: featureApi.translate('notifs.sessionExpired'),
            },
          };
        }

        // Network or server error — don't kick user out, assume still authenticated
        return { authenticated: true };
      } finally {
        // Clear the cached promise after it resolves (or fails)
        authCheckPromise = null;
      }
    })();

    return authCheckPromise;
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    const user = getUser();

    if(user){
      return {
        ...user,
        avatar: getAvatarUrl(user.avatar),
        authenticated: true
      };
    }

    return null;
  },

  /** @DEV_OPTIONS : username | email */
  forgotPassword: async (json) => {
    const errorResponse = {
      success: false,
      error: {
        name: "ForgotPasswordError",
        message: featureApi.translate('error.forgotPassword'),
      },
    };

    try {
      const response: any = await api.post('forgot-password', { json }).json();
      // console.log('response:', response);

      if(response?.success){
        return {
          success: true,
          redirectTo: "/login",
          successNotification: {
            message: response.message || featureApi.translate('notifs.forgotPassword'),
            // description: 
          }
        };
      }
      
      return errorResponse;
    } catch(err: any) {
      // console.log('err:', err);
      if(err?.message){
        errorResponse.error.message = err.message;
      }
      return errorResponse;
    }
  },

  onError: async (error) => {
    // console.log('%cauthProvider onError error:', 'color:yellow', error);

    /**
     * Try to extract the status from the error.
     * Common patterns:
     * - error.response?.status (from fetch/ky)
     * - error.statusCode (from some providers)
     * - error.status (from axios)
     */
    const status = error?.response?.status ?? error?.statusCode; // ?? error?.status;

    switch(status){
      case 401: {
        clearUser(); // Clear data

        return {
          logout: true,
          ...publicRedirect('/login'),
          error: {
            name: 'SessionExpired', // Unauthorized
            message: featureApi.translate('notifs.sessionExpired'),
          },
        };
      }

      case 403: {
        return {
          redirectTo: '/403',
          error: {
            name: 'Forbidden',
            message: featureApi.translate('error.403'), // 'You do not have permission to perform this action.'
          },
        };
      }

      default:
        return { error };
    }
  },
};
