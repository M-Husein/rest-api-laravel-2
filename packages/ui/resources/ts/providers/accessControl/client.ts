import type { CanParams, CanReturnType } from '@refinedev/core';
import { getAccess } from './access';
import type { AccessPayload } from './types';
import { canByPermission, permissionFor } from './permissions';

export const clientCan = async (
  params: CanParams,
): Promise<CanReturnType> => {
  const { resource, action, params: canParams } = params;
  const access: AccessPayload = await getAccess();
  const permission = permissionFor(resource, action);
  const isLoginHistoryShow =
    resource === 'login-histories' && action === 'show';

  const hasBaseAccess =
    canByPermission(access, permission) ||
    (isLoginHistoryShow && canByPermission(access, 'login_histories.view_own'));

  if (!hasBaseAccess) {
    return { can: false };
  }

  if (access.preset !== 'advanced') {
    return { can: true };
  }

  if (
    resource === 'users' &&
    action === 'delete' &&
    canParams?.id != null
  ) {
    if (String(canParams.id) === String(access.user_id)) {
      return {
        can: false,
        reason: 'You cannot delete your own account.',
      };
    }
  }

  if (
    resource === 'login-histories' &&
    action === 'show'
  ) {
    const ownerId =
      canParams?.record?.user_id ??
      canParams?.user_id ??
      canParams?.id;

    if (ownerId != null) {
      return {
        can: String(ownerId) === String(access.user_id),
        reason: 'You can only view your own login history.',
      };
    }

    if (
      !canByPermission(access, 'login_histories.view_own') &&
      !canByPermission(access, 'login_histories.view')
    ) {
      return { can: false };
    }
  }

  return { can: true };
};
