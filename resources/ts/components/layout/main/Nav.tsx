import type { MenuProps } from 'antd';
// import type { IUser } from '@/types/Types';
import { useRef } from "react"; // useEffect, 
import { Menu, Button, Skeleton, Avatar } from 'antd';
import { useLogout } from "@refinedev/core"; // useWarnAboutChange, useTranslate
import { UserOutlined } from '@ant-design/icons';
import { useLocation, NavLink } from 'react-router';
// import { NavLink, A } from '@/components/router';
import { Img } from '@/components/Img';
import { LanguageMenu } from '@/i18n';
// import { getAvatarUrl } from '@/utils/user';
// import { getCurrentLang } from '@/utils/browser';

const createMenu = (key: string, label: any, ...etc: any) => ({
  key,
  label: (
    <NavLink to={key} className="p-2">
      {label}
    </NavLink>
  ),
  ...etc
});

const MENUS: MenuProps['items'] = [
  {
    key: '/',
    label: (
      <NavLink to="/" className="block">
        <Img 
          height={29}
          alt={APP.name} 
          src="/logo.svg"
          fallback="/logo-32x32.png"
        />
      </NavLink>
    ),
    className: "after-no leading-normal",
    style: { marginRight: 'auto' },
  },
  createMenu('/articles', 'Articles'),
  createMenu('/contact-us', 'Contact Us'),
];

const languageMenu = () => ({
  key: 'lang',
  label: <LanguageMenu />,
  className: "after-no",
});

export const Nav = ({ loading, user }:  any) => {
  const location = useLocation();
  // const currentLang = getCurrentLang();
  const { mutate: logout } = useLogout();
  const navRef = useRef<any>(null);

  // console.log('location:', location);

  /** @NOTE : Add loading menu */
  const parseMenus = () => {
    if(loading){
      return [
        ...MENUS,
        {
          key: '1',
          label: <Skeleton.Button active style={{ width: 32, minWidth: 32 }} />,
          className: "after-no leading-normal",
        },
        languageMenu(),
      ];
    }

    if(user){ // ?.authenticated
      let userMenus = [
        {
          key: "/settings",
          label: <NavLink to="/settings">Settings</NavLink>,
        },
        {
          label: "Log Out",
          onClick: () => {
            logout();
            // updateUser(null);
          },
        },
      ];

      // user.username === "SuperAdmin"
      if(user.role === "Admin"){
        userMenus = [
          {
            key: "/app",
            // label: <a href={"/app/" + (currentLang ? "?lang=" + currentLang : "")} rel="nofollow noreferrer">Dashboard</a>, // NavLink
            label: <a href="/app" rel="nofollow noreferrer">Dashboard</a>,
          },
          ...userMenus
        ];
      }

      return [
        ...MENUS,
        {
          key: "user",
          label: (
            <Button className="!p-0">
              <Avatar
                size={30}
                shape="square"
                icon={<UserOutlined />}
                src={user.avatar}
                // src={getAvatarUrl(user.avatar)}
                alt="👤"
                style={{ display: 'flex' }}
              />
            </Button>
          ),
          className: "after-no leading-normal",
          // popupClassName: "!right-0 !left-0",
          popupOffset: [-130, 0],
          children: userMenus,
        },
        languageMenu(),
      ];
    }

    return [
      ...MENUS,
      {
        key: '/login',
        label: (
          <NavLink
            to="/login"
            className="text-gray-800 font-bold p-2 rounded-lg"
          >
            Login
          </NavLink>
        ),
      },
      {
        key: '/register',
        label: (
          <NavLink
            to="/register"
            className="text-gray-800 font-bold p-2 rounded-lg"
          >
            Register
          </NavLink>
        ),
      },
      languageMenu(),
    ];
  }

  return (
    <header className="bg-main h-14 w-full border-b border-zinc-300 !sticky top-0 z-1051">
      <nav 
        ref={navRef}
        className="h-full px-2 max-w-screen-xl mx-auto relative"
      >
        <Menu 
          id="navMain"
          mode="horizontal"
          triggerSubMenuAction="click"
          style={{ borderBottom: 0 }}
          className="h-full items-center bg-main"
          items={parseMenus()}
          selectedKeys={location.pathname !== '/' ? [location.pathname] : []}
          getPopupContainer={() => navRef.current}
        />
      </nav>
    </header>
  );
}
