import { httpRequest } from '@/providers/dataProvider';
import type { AccessPayload } from './types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

let cachedAccess: AccessPayload | null = null;
let pendingAccess: Promise<AccessPayload> | null = null;

export const noneAccessPayload: AccessPayload = {
  preset: 'none',
  ui_mode: null,
  user_id: null,
  roles: [],
  permissions: [],
  is_admin: false,
};

export const getAccess = async (force = false): Promise<AccessPayload> => {
  if (APP.rbac === 'none') {
    return noneAccessPayload;
  }

  if (!force && cachedAccess) {
    return cachedAccess;
  }

  if (pendingAccess && !force) {
    return pendingAccess;
  }

  pendingAccess = (async () => {
    const response = await httpRequest.get('me/access');
    const json = await response.json<ApiResponse<AccessPayload>>();

    if (!json?.success || !json.data) {
      throw new Error('Unable to load RBAC access payload.');
    }

    cachedAccess = json.data;

    return cachedAccess;
  })();

  try {
    return await pendingAccess;
  } finally {
    pendingAccess = null;
  }
};

export const clearAccess = (): void => {
  cachedAccess = null;
  pendingAccess = null;
};

export const checkAccess = async (
  resource: string,
  action: string,
  id?: string | number | null,
): Promise<boolean> => {
  try {
    const response = await httpRequest.post(
      'me/access/check',
      { json: { resource, action, id } },
    );
    const json = await response.json<ApiResponse<{ can: boolean }>>();

    return json?.data?.can === true;
  } catch {
    return false;
  }
};
