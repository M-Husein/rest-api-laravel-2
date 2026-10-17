// import { useMemo } from "react";
// import type { IUser } from '@/types/Types';
import { useGetIdentity, useWarnAboutChange, useTranslate, useLogout } from "@refinedev/core"; // useUpdate
import { Layout, Dropdown, Button, Avatar, Modal } from "antd"; // Switch, Badge,
import { UserOutlined } from '@ant-design/icons'; // , MoonFilled, SunFilled, SettingOutlined
// import { NavLink } from "react-router"; // useLocation,
// import { NavLink } from "@/components/router";
import { LanguageMenu } from '@/i18n';
import { useLogoutAlert } from '@/hooks/useLogoutAlert';

const overlayStyle = {
  left: 'auto',
  right: 0
};

export const Header = () => {
  const { data: currentUser, refetch } = useGetIdentity<any>(); // IUser
  const { mutate: mutateLogout, isPending: isPendingLogout } = useLogout();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const translate = useTranslate();
  // const { mutate, mutation: { isPending } } = useUpdate();

  // const userData = useMemo(() => currentUser || {}, [currentUser]);
  const { name, username, email, avatar } = currentUser || {};
  const fixName = name || username;

  // const location = useLocation();

  useLogoutAlert(modalApi);

  const doLogout = () => {
    if (warnWhen) {
      if (window.confirm(translate("warnWhenUnsavedChanges"))) {
        setWarnWhen(false);
        mutateLogout();
      }
    } else {
      mutateLogout();
    }
  }

  return (
    <Layout.Header
      style={{ padding: '0 14px' }}
      // bg-blue-100 | bg-main
      className="bg-nav !sticky h-12 flex items-center top-0 z-1051 shadow"
      id="navMain"
    >
      <div className="relative h-12 ml-auto flex items-center">
        <div className="h-full flex items-center relative mx-3">
          <LanguageMenu
            overlayStyle={overlayStyle}
            // user={currentUser}
          />
        </div>

        <Dropdown
          getPopupContainer={(triggerNode: any) => triggerNode.parentElement}
          styles={{ root: overlayStyle }}
          trigger={['click']}
          placement="bottomRight"
          menu={{
            // selectable: true,
            // selectedKeys: [location.pathname],
            items: [
              {
                key: "/settings",
                label: (
                  <a // NavLink 
                    href="/settings" // to
                    className="flex items-center justify-center"
                  >
                    <Avatar
                      size={55}
                      shape="square"
                      icon={<UserOutlined />}
                      src={avatar}
                      alt={fixName}
                      style={{ fontSize: 29 }}
                    />
                    <section className="w-48 ml-3">
                      {!!fixName && (
                        <h1 className="text-lg mb-0 leading-6">
                          {fixName}
                        </h1>
                      )}
                      
                      {email && (
                        <div className="text-sm text-gray-500 truncate">
                          {email}
                        </div>
                      )}

                      {/* <Badge
                        // color="#ff7a00"
                        count="View Profile"
                        className="mt-1"
                      /> */}
                    </section>
                  </a>
                )
              },
              {
                type: "divider"
              },
              {
                key: 2,
                label: "Logout",
                disabled: isPendingLogout,
                onClick: doLogout
              }
            ],
          }}
        >
          <Button 
            type="text"
            // className="!p-0 border-gray-400"
            className="flex items-center h-full !p-0"
          >
            <Avatar
              size={30}
              shape="square"
              icon={<UserOutlined />}
              src={avatar}
              // src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
              alt={fixName}
              // crossOrigin="anonymous"
              style={{ display: 'flex' }}
            />
          </Button>
        </Dropdown>

        <b 
          hidden
          className="btnRefetchUser"
          onClick={() => refetch()} 
        />
      </div>

      {modalContextHolder}
    </Layout.Header>
  );
};
