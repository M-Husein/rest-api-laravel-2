import { useMemo } from "react";
import { Refine } from "@refinedev/core";
import type { I18nProvider } from "@refinedev/core";
import routerBindings, { DocumentTitleHandler } from "@refinedev/react-router"; // , UnsavedChangesNotifier
import { Outlet, createBrowserRouter, RouterProvider } from "react-router"; // , useNavigate
import { useTranslation } from "react-i18next";
import { dataProvider } from "@/providers/dataProvider"; // @refinedev/simple-rest
import { authProvider } from "@/providers/authProvider";
import { AppTheme } from "@/contexts/app/Context";
import { SplashScreen } from '@/components/SplashScreen';
import { LocaleProvider, useLocaleContext } from "@/providers/localeProvider";
import { useNotificationProvider } from "@/providers/notificationProvider";
import { RESOURCES } from '@/routes/resources';
import { routes } from "@/routes";
import { loadLocale } from "@/utils/locale/loadLocale";
import { getCurrentLang, changeUrlLang } from '@/utils/browser'; // , localeRegex

const customTitleHandler = () => document.title || APP.name;

const handleRetry = (failureCount: number, error: any) => {
  // 1. If it's an HTTPError from ky, it has error.response
  if (error?.response) {
    /**
     * Try to extract the status from the error.
     * Common patterns:
     * - error.response?.status (from fetch/ky)
     * - error.statusCode (from some providers)
     * - error.status (from axios)
     */
    const status = error?.response?.status ?? error?.statusCode;

    // Never retry on 401
    if (status === 401) return false;

    // Retry on 5xx up to 2 times
    if (status >= 500 && status <= 599) {
      return failureCount <= 2;
    }

    // Do not retry other statuses (400, 404, 429, etc.)
    return false;
  }

  // 2. No response -> network error (offline, DNS, CORS) OR ky TimeoutError.
  // Retry these up to 2 times.
  return failureCount <= 2;
};

const RefineProvider = () => {
  // const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const i18nProvider = useMemo<I18nProvider>(
    () => ({
      changeLocale: async (lang: string) => {
        // Remove this if use i18next-browser-languagedetector
        localStorage.setItem("i18nextLng", lang);

        const currentPath = window.location.pathname;

        if(!currentPath.startsWith('/app')){
          // Reload binds new Laravel localization headers
          changeUrlLang(lang, currentPath);
        }
        else{
          document.documentElement.lang = lang;

          await i18n.changeLanguage(lang);
          await loadLocale(lang);
        }
      },
      getLocale: () => i18n.language,
      translate: (key, params) => t(key, params) as string,
    }),
    [t, i18n]
  );

  const { antdLocale } = useLocaleContext();

  if (!antdLocale) {
    return <SplashScreen />; // null
  }

  return (
    <AppTheme locale={antdLocale}>
      <Refine 
        dataProvider={dataProvider(APP.api)}
        i18nProvider={i18nProvider}
        notificationProvider={useNotificationProvider}
        routerProvider={routerBindings}
        authProvider={authProvider}
        resources={RESOURCES}
        options={{
          // warnWhenUnsavedChanges: true,
          disableTelemetry: true,
          syncWithLocation: false, // default true : https://refine.dev/docs/api-reference/core/components/refine-config/#syncwithlocation
          // useNewQueryKeys: true,
          redirect: {
            afterCreate: false,
            afterEdit: false,
          },
          reactQuery: {
            clientConfig: {
              defaultOptions: {
                queries: {
                  staleTime: 3e4, // 30 sec
                  // retry: 2,
                  retry: handleRetry,
                  retryDelay: (attemptIndex) => Math.min(1e3 * 2 ** attemptIndex, 3e4),
                },
              },
            },
          },
        }}
      >
        <Outlet />

        {/* <UnsavedChangesNotifier /> */}

        <DocumentTitleHandler handler={customTitleHandler} />
      </Refine>
    </AppTheme>
  );
};

const currentLang = getCurrentLang(true);
// console.log('App currentLang:', currentLang);

const router = createBrowserRouter(
  [
    {
      Component: RefineProvider,
      children: routes
    },
  ], 
  { basename: currentLang ? "/" + currentLang : "" }
);

export const App = () => (
  <LocaleProvider>
    <RouterProvider router={router} />
  </LocaleProvider>
);

// changeLocale: async (lang) => {
//   const newParams = new URLSearchParams(window.location.search);
//   lang !== APP.defaultLang 
//     ? newParams.set("lang", lang)
//     : newParams.delete("lang");

//   navigate({
//     pathname: window.location.pathname, 
//     search: newParams.toString()
//   }, { replace: true });

//   document.documentElement.lang = lang;

//   // Remove this if use i18next-browser-languagedetector
//   localStorage.setItem("i18nextLng", lang);

//   await i18n.changeLanguage(lang);
//   await loadLocale(lang);

//   // console.log('lang:', lang);
//   // console.log('Language changed to:', i18n.language);
// },

// changeLocale: async (lang: string) => {
//   // Remove this if use i18next-browser-languagedetector
//   localStorage.setItem("i18nextLng", lang);
//   document.documentElement.lang = lang;

//   const currentPath = window.location.pathname;

//   console.log('lang:', lang);
//   console.log('currentPath:', currentPath);
//   console.log('currentPath.match(localeRegex):', currentPath.match(localeRegex));
//   console.log(
//     'replace:', 
//     currentPath.replace(localeRegex, lang !== APP.defaultLang ? lang : "")
//   );

//   navigate(
//     currentPath.match(localeRegex) 
//       ? currentPath.replace(localeRegex, lang !== APP.defaultLang ? lang : "")
//       : "/" + (lang !== APP.defaultLang ? lang : '') + currentPath, 
//     { replace: true }
//   );

//   await i18n.changeLanguage(lang);
//   await loadLocale(lang);
// },