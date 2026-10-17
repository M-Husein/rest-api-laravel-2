import { createBrowserRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n';
import { adminRoutes } from '@/routes/admin';
import { RefineProvider } from './RefineProvider';

const router = createBrowserRouter(
  [
    {
      Component: RefineProvider,
      children: adminRoutes,
    },
  ],
  { basename: '/app' }
);

export const AdminApp = () => (
  <LocaleProvider>
    <RouterProvider router={router} />
  </LocaleProvider>
);
