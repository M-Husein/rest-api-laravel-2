import { useMemo } from "react";
import { useGetIdentity } from "@refinedev/core";
import { useDocumentTitle } from "@/utils/hooks/useDocumentTitle";
import { Avatar, Card, Tabs } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ProfileInfoSection } from "./parts/ProfileInfoSection";
import { AvatarSection } from "./parts/AvatarSection";
import { ChangePasswordSection } from "./parts/ChangePasswordSection";
import { SocialProvidersSection } from "./parts/SocialProvidersSection";
import { SessionsSection } from "./parts/SessionsSection";
import { TokensSection } from "./parts/TokensSection";

export default function Page(){
  useDocumentTitle('Settings • ' + APP.name);

  const { data: identity, refetch } = useGetIdentity<any>();
  // console.log('identity:', identity);

  const tabs = useMemo(() => [
    {
      key: 'profile',
      label: "Profile",
      children: <ProfileInfoSection identity={identity} refetch={refetch} />
    },
    {
      key: 'avatar',
      label: "Avatar",
      children: <AvatarSection identity={identity} refetch={refetch} />
    },
    {
      key: 'password',
      label: "Password", 
      children: <ChangePasswordSection identity={identity} refetch={refetch} />
    },
    {
      key: 'social',
      label: "Connected Accounts", 
      children: <SocialProvidersSection />
    },
    {
      key: 'sessions',
      label: "Web Sessions",
      children: <SessionsSection />
    },
    {
      key: 'tokens',
      label: "Mobile Devices",
      children: <TokensSection />
    }
  ], [identity, refetch]);

  return (
    <Card className="shadow max-w-2xl mx-auto my-4">
      <Card.Meta
        className="items-center"
        styles={{
          title: {
            marginBottom: 0
          }
        }}
        avatar={
          <Avatar
            alt="👤"
            size={55}
            shape="square"
            src={identity?.avatar}
            icon={<UserOutlined />}
            className="flex-shrink-0"
          />
        }
        title={identity?.name ?? '—'}
        description={identity?.email && <a href={'mailto:' + identity.email}>{identity.email}</a>}
      />
      <hr className="mb-0" />
      <Tabs
        destroyOnHidden
        defaultActiveKey="profile"
        items={tabs}
      />
    </Card>
  );
}
