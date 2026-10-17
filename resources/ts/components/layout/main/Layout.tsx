import { useGetIdentity } from "@refinedev/core";
import { Layout as AntLayout, Modal } from 'antd';
import { useLogoutAlert } from '@/hooks/useLogoutAlert';
import { Nav } from './Nav';

export const Layout = ({
  children,
}: any) => {
  const { data, isLoading, refetch } = useGetIdentity();
  const [modalApi, modalContextHolder] = Modal.useModal();

  useLogoutAlert(modalApi);

  return (
    <AntLayout className="min-h-fullscreen">
      <AntLayout>
        <Nav 
          loading={isLoading} 
          user={data}
        />

        <AntLayout.Content>
          {children}

          <b 
            hidden
            aria-hidden
            className="btnRefetchUser"
            onClick={() => refetch()} 
          />
        </AntLayout.Content>
      </AntLayout>

      {modalContextHolder}
    </AntLayout>
  );
}
