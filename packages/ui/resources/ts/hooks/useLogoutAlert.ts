import { useEffect } from 'react';
// import { Modal } from 'antd';
import { useTranslate } from '@refinedev/core';
import { clearUser } from '@/utils/user';
import { toggleInert } from '@/utils/dom';

export const useLogoutAlert = (modalApi: any) => {
  const translate = useTranslate();
  // const [modalApi, modalContextHolder] = Modal.useModal();

  useEffect(() => {
    const onMessage = (evt: any) => {
      if(evt.data.type === "LOGOUT"){
        clearUser();
        toggleInert(true);
        
        modalApi.warning({
          centered: true,
          keyboard: false,
          mask: { blur: true }, // v6
          title: "Ups…",
          content: translate('warn.logout'), // "You are logged out from another tab/window.",
          okText: "Login",
          okButtonProps: {
            onClick: () => window.location.replace('/login')
          },
        });
      }
    }

    const BC = new BroadcastChannel(import.meta.env.VITE_BC_NAME);

    BC.addEventListener('message', onMessage);

    return () => {
      toggleInert(false);
      BC.removeEventListener('message', onMessage);
    }
  }, [modalApi]); // , translate

  // return modalContextHolder;
}
