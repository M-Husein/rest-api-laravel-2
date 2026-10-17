import { lazy, Suspense } from "react";
import { Authenticated } from "@refinedev/core";
import { Outlet } from "react-router";
import { View as ErrorComponent } from '@/components/views/errors/View';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SplashScreen } from '@/components/SplashScreen';
import { CrossZoneRedirect } from '@/components/CrossZoneRedirect';
import { lazyComponent } from '@/utils/components';

const LayoutAdmin = lazy(() => import('@/components/layout/admin/default'));

const lazyApp = (component: any) => (
  <ErrorBoundary>
    <Suspense fallback={<SplashScreen />}>
      {component}
    </Suspense>
  </ErrorBoundary>
);

const LayoutAdminApp = () => (
  <Authenticated
    key="authenticated-admin"
    fallback={<CrossZoneRedirect to="/login" />}
  >
    {lazyApp(
      <LayoutAdmin>
        <Outlet />
      </LayoutAdmin>
    )}
  </Authenticated>
);

export const adminRoutes: any[] = [
  {
    path: "/",
    element: <LayoutAdminApp />,
    children: [
      {
        index: true,
        element: lazyComponent(lazy(() => import('@/pages/admin/home/Page')))
      },
      {
        path: "devs",
        element: lazyComponent(lazy(() => import('@/pages/admin/devs/Page')))
      },
      {
        path: "settings",
        children: [
          {
            path: "users",
            children: [
              {
                index: true,
                element: lazyComponent(lazy(() => import('@/pages/admin/settings/users/Page')))
              },
            ],
          },
        ],
      },
    ]
  },
  { path: "403", Component: <ErrorComponent code={403} /> },
  { path: "*", Component: ErrorComponent },
];
