import { useMemo } from 'react';
import { Refine } from '@refinedev/core';
import type { I18nProvider } from '@refinedev/core';
import routerBindings, { DocumentTitleHandler } from '@refinedev/react-router';
import { Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { dataProvider } from '@/providers/dataProvider';
import { authProvider } from '@/providers/authProvider';
import { AppTheme } from '@/contexts/app/Context';
import { SplashScreen } from '@/components/SplashScreen';
import { useNotificationProvider } from '@/providers/notificationProvider';
import { RESOURCES } from '@/routes/resources';
import { useLocaleContext, loadLocale } from '@/i18n';
import { zoneStrategy } from '@/i18n/factory';

const customTitleHandler = () => document.title || APP.name;

const handleRetry = (failureCount: number, error: any) => {
  if (error?.response) {
    const status = error?.response?.status ?? error?.statusCode;

    if (status === 401) return false;

    if (status >= 500 && status <= 599) {
      return failureCount <= 2;
    }

    return false;
  }

  return failureCount <= 2;
};

export const RefineProvider = () => {
  const { t, i18n } = useTranslation();
  const strategy = zoneStrategy();

  const i18nProvider = useMemo<I18nProvider>(
    () => ({
      changeLocale: async (lang: string) => {
        await strategy.apply(lang, { i18n, loadLocale });
      },
      getLocale: () => i18n.language,
      translate: (key, params) => t(key, params) as string,
    }),
    [t, i18n, strategy]
  );

  const { antdLocale } = useLocaleContext();

  if (!antdLocale) {
    return <SplashScreen />;
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
          disableTelemetry: true,
          syncWithLocation: false,
          redirect: {
            afterCreate: false,
            afterEdit: false,
          },
          reactQuery: {
            clientConfig: {
              defaultOptions: {
                queries: {
                  staleTime: 3e4,
                  retry: handleRetry,
                  retryDelay: (attemptIndex) => Math.min(1e3 * 2 ** attemptIndex, 3e4),
                },
              },
            },
          },
        }}
      >
        <Outlet />

        <DocumentTitleHandler handler={customTitleHandler} />
      </Refine>
    </AppTheme>
  );
};
