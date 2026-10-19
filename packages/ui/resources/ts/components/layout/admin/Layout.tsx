import '@/style/components/layout_main.scss';

// import { useMemo } from "react";
// import { ThemedLayoutV2 } from "@refinedev/antd"; // useTranslate, ThemedTitleV2, ThemedSiderV2
// import { HttpError, useList } from "@refinedev/core"; // useGetIdentity, useOne, useUpdate
import { Layout as AntdLayout, FloatButton } from 'antd';
import { FaArrowUp } from "react-icons/fa";
import { Title } from './Title';
import { Header } from './Header';
import { Sider } from './Sider';
import { Provider as ThemedLayoutContextProvider } from "@/contexts/themedLayout";

type LayoutProps = {
  // appName: string,
  children: any,
}

export const Layout = ({
  // appName,
  children,
  // initialSiderCollapsed,
  // Footer,
  // OffLayoutArea,
}: LayoutProps) => {
  // @ts-expect-error - unary plus on `string | null` from getItem
  const initSiderCollapsed: any = !!+localStorage.getItem('asideMin');

  // const { data: user } = useGetIdentity<IUser>();
  // const isSysAdmin = user?.is_sysadmin; //  && user?.name === 'system'

  return (
    <ThemedLayoutContextProvider
      initialSiderCollapsed={initSiderCollapsed} // initialSiderCollapsed
    >
      <AntdLayout className="min-h-fullscreen" data-nosnippet={true}>
        <Sider
          theme="light"
          Title={({ collapsed }: any) => (
            <Title
              collapsed={collapsed}
              text={APP.name}
              icon={<img width={24} height={24} src="/logo-36x36.png" alt={APP.name} />}
            />
          )}
        />

        <AntdLayout>
          <Header />

          <AntdLayout.Content className="lg_p-5 p-2 relative">
            {children}

            {/* {OffLayoutArea && <OffLayoutArea />} */}
          </AntdLayout.Content>

          {/* {Footer && <Footer />} */}
          <footer className="py-3 px-4 text-xs text-gray-500">
            @ 2024, Made with ❤️ <strong>{APP.name}</strong>
          </footer>

          <FloatButton.BackTop
            type="primary"
            visibilityHeight={99}
            icon={<FaArrowUp />} // @ts-expect-error - react-icons vs antd icon slot type
            tabIndex={-1}
            style={{ marginBottom: -40, marginRight: -16 }}
            title="Back to top" // tooltip
          />
        </AntdLayout>
      </AntdLayout>
    </ThemedLayoutContextProvider>
  );
}
