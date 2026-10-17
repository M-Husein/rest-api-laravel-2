import { useState } from "react";
import { useList, useDelete, useInvalidate } from "@refinedev/core";
import { Button, Popconfirm, Tag } from "antd";
import { DisconnectOutlined, LinkOutlined } from "@ant-design/icons";
import { socialsProvider } from "@/providers/socialsProvider";
import { useSocialAuth } from "@/utils/hooks/useSocialAuth";

type LinkedProvider = {
  provider: string;
  avatar: string | null;
  name: string | null;
  created_at: string;
};

export const SocialProvidersSection = () => {
  const API = "auth/providers";
  const invalidate = useInvalidate();
  // const [openingProvider, setOpeningProvider] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState<string | null>('');
  const { popupOpen, handleAuth } = useSocialAuth({
    onSuccess: () => {
      invalidate({ resource: API, invalidates: ['list'] });
      // setOpeningProvider(null);
    }
  });
  
  const { result: linkedData, query } = useList({
    resource: API,
    pagination: { mode: "off" }
  });

  const { mutate: unlinkMutate } = useDelete();

  // const linkedProviders = (linkedData?.data as any)?.data ?? [];
  const linkedProviders = (linkedData?.data as any) ?? [];
  const linkedMap = new Map(linkedProviders.map((p: LinkedProvider) => [p.provider, p]));

  // const handleConnect = (provider: string) => {
  //   setOpeningProvider(provider);
  //   handleAuth(provider);
  // };

  const handleUnlink = (provider: string) => {
    setUnlinking(provider);
    unlinkMutate({
      resource: API,
      id: provider,
      successNotification: (res: any) => ({
        type: 'success', 
        message: res?.message || 'Provider linked.'
      }),
      errorNotification: (err: any) => ({
        type: 'error', 
        message: err?.message || 'Failed to link provider.'
      })
    }, {
      onSuccess: () => invalidate({ invalidates: ['all'] }),
      onSettled: () => setUnlinking('') // null
    });
  };

  if(query.isLoading || query.isFetching){
    return (
      <div className="text-center">
        <b className="spin-border m-4" role="status" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {socialsProvider.map((item: any) => {
        const linked = linkedMap.get(item.name) as LinkedProvider | undefined;
        const isUnlinking = unlinking === item.name;
        return (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 rounded border shadow"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <div>
                <div className="font-medium text-sm capitalize">{item.name}</div>
                {linked && (
                  <div className="text-xs">
                    Connected as {linked.name ?? 'Unknown'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {linked ? (
                <>
                  <Tag color="success" className="m-0">Connected</Tag>
                  <Popconfirm
                    title="Unlink provider"
                    description={`Remove ${item.name} login from your account?`}
                    onConfirm={() => handleUnlink(item.name)}
                    okText="Unlink"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancel"
                  >
                    <Button
                      danger
                      icon={<DisconnectOutlined />}
                      disabled={isUnlinking || !!popupOpen}
                      loading={isUnlinking}
                    >
                      Unlink
                    </Button>
                  </Popconfirm>
                </>
              ) : (
                <Button
                  ghost
                  type="primary"
                  icon={<LinkOutlined />}
                  disabled={!!popupOpen}
                  loading={popupOpen === item.name} // !!popupOpen && openingProvider === item.name
                  onClick={() => handleAuth(item.name)} // handleConnect
                >
                  Connect
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
