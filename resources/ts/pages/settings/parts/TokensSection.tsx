import { useState } from "react";
import { useList, useDelete, useCustomMutation, useInvalidate } from "@refinedev/core";
import { Button, Popconfirm, Tag, Empty } from "antd";
import {
  DeleteOutlined,
  // LoadingOutlined,
  LogoutOutlined,
  MobileOutlined
} from "@ant-design/icons";

type Token = {
  id: number;
  name: string;
  last_used: string;
  expires_at: string;
  created_at: string;
  is_current: boolean;
};

export const TokensSection = () => {
  const invalidate = useInvalidate();
  const [revoking, setRevoking] = useState<string | null>(null);

  const { result: tokensData, query } = useList<Token>({
    resource: 'tokens',
    pagination: { mode: "off" }
  });

  const { mutate: deleteMutate } = useDelete();

  // Bulk — useCustomMutation → DELETE /tokens/all
  const { mutate: bulkMutate } = useCustomMutation();

  const tokens: Token[] = (tokensData?.data as any) ?? [];

  const revokeOne = (id: number) => {
    setRevoking(String(id));
    deleteMutate(
      {
        resource: 'tokens',
        id,
        successNotification: (res: any) => ({
          type: 'success',
          message: res?.message || 'Device revoked.'
        }),
        errorNotification: (err: any) => ({
          type: 'error',
          message: err?.message || 'Failed to revoke device.'
        })
      },
      {
        onSuccess: () => invalidate({ resource: 'tokens', invalidates: ['list'] }),
        onSettled: () => setRevoking(null)
      }
    );
  };

  const revokeAll = () => {
    setRevoking('all');
    bulkMutate(
      {
        url: 'tokens/all',
        method: 'delete',
        values: {},
        successNotification: (res: any) => ({
          type: 'success',
          message: res?.message || 'All devices revoked.'
        }),
        errorNotification: (err: any) => ({
          type: 'error',
          message: err?.message || 'Failed to revoke devices.'
        })
      },
      {
        onSuccess: () => invalidate({ resource: 'tokens', invalidates: ['list'] }),
        onSettled: () => setRevoking(null)
      }
    );
  };

  if(query.isLoading || query.isFetching){
    return (
      // <div className="flex justify-center py-4">
      //   <b className="spin-border" role="status" />
      // </div>
      <div className="text-center">
        <b className="spin-border m-4" role="status" />
      </div>
    );
  }

  const otherTokens = tokens.filter(t => !t.is_current);

  return (
    <div className="space-y-3">
      {otherTokens.length > 0 && (
        <div className="flex justify-end mb-2">
          <Popconfirm
            title="Revoke all other devices?"
            description="All other mobile devices will be logged out."
            onConfirm={revokeAll}
            okText="Revoke All"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<LogoutOutlined />}
              loading={revoking === 'all'}
            >
              Revoke All Others
            </Button>
          </Popconfirm>
        </div>
      )}

      {/* {!tokens.length && (
        <div className="text-center py-4">No active device tokens found.</div>
      )} */}

      {tokens.length 
        ? tokens.map(item => (
          <div
            key={item.id}
            className={(item.is_current ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50") + " flex items-center justify-between p-3 rounded border"}
          >
            <div className="flex items-center gap-3">
              <MobileOutlined className="text-xl" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{item.name}</p>
                  {item.is_current && (
                    <Tag color="blue" className="m-0 text-xs">Current</Tag>
                  )}
                </div>
                <p className="text-xs">
                  Last used {item.last_used}
                  {item.expires_at !== 'Never' && ` · Expires ${item.expires_at}`}
                </p>
              </div>
            </div>

            {!item.is_current && (
              <Popconfirm
                title="Revoke this device?"
                onConfirm={() => revokeOne(item.id)}
                okText="Revoke"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  // icon={revoking === item.id + '' ? <LoadingOutlined /> : <DeleteOutlined />}
                  icon={<DeleteOutlined />}
                  disabled={!!revoking}
                  loading={revoking === item.id + ''}
                />
              </Popconfirm>
            )}
          </div>
        ))
        : <Empty />
      }
    </div>
  );
};
