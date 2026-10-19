import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { getFeatureProviders, composeProviders } from '@/core/feature';
import { FEATURES } from '@/features.generated';
import { LocaleProvider } from '@/i18n';
import { adminRoutes } from '@/routes/admin';
import { RefineProvider } from './RefineProvider';

const featureProviders = getFeatureProviders(FEATURES);

export const AdminApp = () => {
  const router = useMemo(
    () =>
      createBrowserRouter(
        [
          {
            Component: RefineProvider,
            children: adminRoutes,
          },
        ],
        { basename: '/app' }
      ),
    []
  );

  return (
    <LocaleProvider>
      {composeProviders(featureProviders, <RouterProvider router={router} />)}
    </LocaleProvider>
  );
};
