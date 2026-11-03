import type { AccessControlProvider } from '@refinedev/core';
import { RefineProvider } from './RefineProvider';
import { createAccessControlProvider } from '@/providers/accessControl';

interface AdminRefineProviderProps {
  accessControlProvider?: AccessControlProvider;
}

export const AdminRefineProvider = (props: AdminRefineProviderProps) => {
  const accessControlProvider =
    props.accessControlProvider ??
    (APP.rbac === 'none' ? undefined : createAccessControlProvider());

  return <RefineProvider accessControlProvider={accessControlProvider} />;
};
