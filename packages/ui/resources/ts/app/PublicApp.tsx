import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { featureApi, getFeatureProviders, composeProviders } from '@/core/feature';
import { FEATURES } from '@/features.generated';
import { LocaleProvider } from '@/i18n';
import { publicRoutes } from '@/routes/public';
import { RefineProvider } from './RefineProvider';

const featureProviders = getFeatureProviders(FEATURES);

export const PublicApp = () => {
  const router = useMemo(
    () =>
      createBrowserRouter(
        [
          {
            Component: RefineProvider,
            children: publicRoutes,
          },
        ],
        { basename: featureApi.getRouterBasename() }
      ),
    []
  );

  return (
    <LocaleProvider>
      {composeProviders(featureProviders, <RouterProvider router={router} />)}
    </LocaleProvider>
  );
};
