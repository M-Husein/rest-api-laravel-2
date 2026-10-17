import { createBrowserRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n';
import { publicStrategy } from '@/i18n/factory';
import { publicRoutes } from '@/routes/public';
import { RefineProvider } from './RefineProvider';

const router = createBrowserRouter(
  [
    {
      Component: RefineProvider,
      children: publicRoutes,
    },
  ],
  { basename: publicStrategy.getRouterBasename() }
);

export const PublicApp = () => (
  <LocaleProvider>
    <RouterProvider router={router} />
  </LocaleProvider>
);
