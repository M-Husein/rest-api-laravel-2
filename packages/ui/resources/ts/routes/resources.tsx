import { HomeOutlined, UserOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons';
import { LuFlag } from "react-icons/lu";
import { GrCurrency } from "react-icons/gr";
import { PiMapPinAreaFill, PiCity, PiPhone } from "react-icons/pi";

export const RESOURCES: any[] = [
  {
    name: "home",
    list: "/",
    meta: { label: "Home", icon: <HomeOutlined /> }
  },
  {
    name: "articles",
    list: "/articles",
    meta: { label: "Articles", external: true }
  },
  {
    name: "currency",
    list: "/currencies",
    meta: { label: "Currencies", icon: <GrCurrency /> }
  },
  {
    name: "country",
    list: "/country",
    meta: { label: "Country", icon: <LuFlag /> }
  },
  {
    name: "province",
    list: "/province",
    meta: { label: "Province", icon: <PiMapPinAreaFill /> }
  },
  {
    name: "city",
    list: "/city",
    meta: { label: "City", icon: <PiCity /> }
  },
  {
    name: "devs",
    list: "/devs",
    meta: { label: "Devs" }
  },
  {
    name: "settings",
    meta: { icon: <SettingOutlined /> },
  },
  {
    name: "app",
    list: "/settings/app",
    meta: { parent: "settings", label: "App", icon: <ToolOutlined /> },
  },
  {
    name: "users",
    list: "/settings/users",
    meta: { parent: "settings", label: "Users", icon: <UserOutlined /> },
  },
  {
    name: "contacts",
    list: "/settings/contacts",
    meta: { parent: "settings", label: "Contacts", icon: <PiPhone /> },
  },
];
