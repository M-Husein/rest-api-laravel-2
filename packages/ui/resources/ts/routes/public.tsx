import { lazy } from "react";
import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";
import { Outlet } from "react-router";
import { View as ErrorComponent } from '@/components/views/errors/View';
import { CrossZoneRedirect } from '@/components/CrossZoneRedirect';
import { Layout } from '@/components/layout/main/Layout';
import { SplashScreen } from '@/components/SplashScreen';
import { lazyComponent } from '@/utils/components';

const PrivateRoute = ({ children }: any) => (
  <Authenticated
    key="auth-inner"
    fallback={<CatchAllNavigate to="/login" />}
  >
    {children}
  </Authenticated>
);

const LayoutAuth = () => (
  <Authenticated
    key="auth-outer"
    fallback={<Outlet />}
  >
    <CrossZoneRedirect to="/app" />
  </Authenticated>
);

export const publicRoutes: any[] = [
  {
    path: "/",
    element: <Layout><Outlet /></Layout>,
    children: [
      {
        index: true,
        element: lazyComponent(lazy(() => import('@/pages/home/Page')), <SplashScreen />)
      },
      {
        path: "articles",
        element: lazyComponent(lazy(() => import('@/pages/articles/Page')), <SplashScreen />)
      },
      {
        path: "contact-us",
        element: lazyComponent(lazy(() => import('@/pages/contact-us/Page')), <SplashScreen />)
      },

      // Private
      {
        element: (
          <PrivateRoute>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          {
            path: "settings",
            element: lazyComponent(lazy(() => import('@/pages/settings/Page')), <SplashScreen />)
          },
        ]
      },
    ],
  },

  {
    path: "verification",
    children: [
      {
        index: true,
        element: lazyComponent(lazy(() => import('@/pages/verification/email/Page')), <SplashScreen />)
      },
    ],
  },
  {
    path: '/',
    element: <LayoutAuth />,
    children: [
      {
        path: "login",
        element: lazyComponent(lazy(() => import('@/pages/login/Page')), <SplashScreen />)
      },
      {
        path: "register",
        element: lazyComponent(lazy(() => import('@/pages/register/Page')), <SplashScreen />)
      },
      {
        path: "forgot-password",
        element: lazyComponent(lazy(() => import('@/pages/forgot-password/Page')), <SplashScreen />)
      },
      {
        path: "reset-password",
        element: lazyComponent(lazy(() => import('@/pages/reset-password/Page')), <SplashScreen />)
      },
    ],
  },
  { path: "403", Component: <ErrorComponent code={403} /> },
  { path: "*", Component: ErrorComponent },
];
