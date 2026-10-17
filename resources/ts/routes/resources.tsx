import { HomeOutlined, UserOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons'; // UsergroupAddOutlined, 
// import { AiOutlineHome } from "react-icons/ai";
// import { TbBowlSpoon } from "react-icons/tb";
// import { ImSpoonKnife } from "react-icons/im";
import { LuFlag } from "react-icons/lu"; // LuUserRoundCog, 
import { GrCurrency } from "react-icons/gr";
import { PiMapPinAreaFill, PiCity, PiPhone } from "react-icons/pi";

export const RESOURCES: any[] = [
  {
    name: "home",
    list: "/app", // /admin 
    meta: { label: "Home", icon: <HomeOutlined /> } 
  },
  {
    name: "articles",
    list: "/articles",
    meta: { label: "Articles" }
  },
  {
    name: "currency", 
    list: "/app/currencies",
    meta: { label: "Currencies", icon: <GrCurrency /> }
  },
  {
    name: "country", 
    list: "/app/country",
    meta: { label: "Country", icon: <LuFlag /> }
  },
  {
    name: "province", 
    list: "/app/province",
    meta: { label: "Province", icon: <PiMapPinAreaFill /> }
  },
  {
    name: "city", 
    list: "/app/city",
    meta: { label: "City", icon: <PiCity /> }
  },
  {
    name: "devs",
    list: "/app/devs",
    meta: { label: "Devs" } // , icon: <b>⚙️</b>
  },
  {
    name: "settings",
    meta: { icon: <SettingOutlined /> }, 
  },
  {
    name: "app",
    list: "/app/settings/app",
    meta: { parent: "settings", label: "App", icon: <ToolOutlined /> },
  },
  {
    name: "users", 
    list: "/app/settings/users",
    meta: { parent: "settings", label: "Users", icon: <UserOutlined /> },
  },
  {
    name: "contacts",
    list: "/app/settings/contacts",
    meta: { parent: "settings", label: "Contacts", icon: <PiPhone /> },
  },
  // {
  //   name: "team", 
  //   list: "/app/settings/teams", // /admin/users
  //   meta: { parent: "settings", label: "Teams", icon: <UsergroupAddOutlined /> },
  // },
  // {
  //   name: "roles", 
  //   list: "/app/settings/roles-permissions", // /admin/roles-permissions
  //   meta: { parent: "settings", label: "Roles & Permissions", icon: <LuUserRoundCog /> },
  // },
];
