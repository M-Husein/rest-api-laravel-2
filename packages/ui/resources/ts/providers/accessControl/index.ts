import type {
  AccessControlProvider,
  CanParams,
  CanReturnType,
} from '@refinedev/core';
import { clientCan } from './client';
import { clearAccess, getAccess } from './access';
import { serverCan } from './server';
import type { AccessPayload } from './types';

export const shouldEnableAccessControl = (): boolean =>
  APP.rbac !== 'none';

export const createAccessControlProvider = (): AccessControlProvider => ({
  can: async (
    params: CanParams,
  ): Promise<CanReturnType> => {
    const access: AccessPayload = await getAccess();

    if (access.preset === 'none') {
      return { can: true };
    }

    if (access.preset === 'advanced' && access.ui_mode === 'client') {
      return clientCan(params);
    }

    if (access.preset === 'advanced' && access.ui_mode === 'server') {
      return serverCan(params);
    }

    return clientCan(params);
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: false,
    },
  },
});

export { clearAccess, getAccess };
export type { AccessPayload };
