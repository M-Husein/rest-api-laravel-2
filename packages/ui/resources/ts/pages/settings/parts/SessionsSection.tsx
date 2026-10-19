import { useState } from "react";
import { useList, useDelete, useCustomMutation, useInvalidate } from "@refinedev/core";
import { Button, Popconfirm, Tag, Empty } from "antd"; // Skeleton
import {
  DeleteOutlined,
  LaptopOutlined,
  LogoutOutlined,
  MobileOutlined
} from "@ant-design/icons";
import Bowser from "bowser";

type Session = {
  id: string;
  ip_address: string;
  user_agent: string;
  last_active: string;
  is_current: boolean;
};

export const SessionsSection = () => {
  const invalidate = useInvalidate();
  const [revoking, setRevoking] = useState<string | null>(null);

  const { result: sessionsData, query } = useList<Session>({
    resource: 'sessions',
    pagination: { mode: "off" }
  });
  // console.log('sessionsData:', sessionsData);

  const { mutate: deleteMutate } = useDelete();

  // Bulk — useCustomMutation → DELETE /sessions/others
  const { mutate: bulkMutate } = useCustomMutation();

  const sessions: Session[] = (sessionsData?.data as any) ?? [];

  const revokeOne = (id: string) => {
    setRevoking(id);
    deleteMutate(
      {
        resource: 'sessions',
        id,
        successNotification: (res: any) => ({
          type: 'success',
          message: res?.message || 'Session revoked.'
        }),
        errorNotification: (err: any) => ({
          type: 'error',
          message: err?.message || 'Failed to revoke session.'
        })
      },
      {
        onSuccess: () => invalidate({ resource: 'sessions', invalidates: ['list'] }),
        onSettled: () => setRevoking(null)
      }
    );
  };

  const revokeOthers = () => {
    setRevoking('others');
    bulkMutate(
      {
        url: 'sessions/others',
        method: 'delete',
        values: {},
        successNotification: (res: any) => ({
          type: 'success',
          message: res?.message || 'Other sessions revoked.'
        }),
        errorNotification: (err: any) => ({
          type: 'error',
          message: err?.message || 'Failed to revoke sessions.'
        })
      },
      {
        onSuccess: () => invalidate({ resource: 'sessions', invalidates: ['list'] }),
        onSettled: () => setRevoking(null)
      }
    );
  };

  if(query.isLoading || query.isFetching){
    return (
      <div className="text-center">
        <b className="spin-border m-4" role="status" />
      </div>
    );
    // return <Skeleton active title={false} paragraph={{ rows: 3, width: '100%' }} />;
  }

  const otherSessions = sessions.filter(s => !s.is_current);

  const renderSessionItem = (item: any) => {
    const userAgent: any = Bowser.parse(item.user_agent || '', item.uad);
    // console.log('userAgent:', userAgent);
    return (
      <div
        key={item.id}
        className={(item.is_current ? "border-blue-200 bg-blue-50" : "bg-gray-50") + " flex items-center justify-between p-3 rounded border"}
      >
        <div className="flex items-center gap-3">
          <div className="text-xl text-center">
            {userAgent.platform?.type === 'mobile'
              ? <MobileOutlined />
              : <LaptopOutlined />
            }
            <img
              alt="" 
              src={`/media/img/os/${userAgent.os?.name?.toLowerCase()}.svg`}
              width={35}
              loading="lazy"
              className="block mx-auto mt-1"
            />
            <div className="text-xs mt-1">
              {userAgent.os?.name} {userAgent.os?.versionName || userAgent.os?.version || 'Unknown OS'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 font-medium text-sm">
                <img
                  alt="" 
                  src={`/media/img/browsers/${userAgent.browser?.name?.toLowerCase()}.svg`}
                  width={37}
                  loading="lazy"
                />
                <div>
                  {userAgent.browser?.name || 'Unknown Browser'}
                  <div className="text-xs">{userAgent.browser?.version}</div>
                </div>
              </div>
              {item.is_current && (
                <Tag color="blue" className="m-0 text-xs">Current</Tag>
              )}
            </div>
            <div className="text-xs mt-1">
              {item.ip_address} · {item.last_active}
            </div>
          </div>
        </div>

        {!item.is_current && (
          <Popconfirm
            title="Revoke this session?"
            onConfirm={() => revokeOne(item.id)}
            okText="Revoke"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!!revoking}
              loading={revoking === item.id}
            />
          </Popconfirm>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {otherSessions.length > 0 && (
        <div className="flex justify-end mb-2">
          <Popconfirm
            title="Revoke all other sessions?"
            description="You will be logged out from all other web sessions."
            onConfirm={revokeOthers}
            okText="Revoke All"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<LogoutOutlined />}
              loading={revoking === 'others'}
            >
              Revoke All Others
            </Button>
          </Popconfirm>
        </div>
      )}

      {sessions.length 
        ? sessions.map(renderSessionItem)
        : <Empty /> // <div className="text-center py-4">No active sessions found.</div>
      }
    </div>
  );
};
