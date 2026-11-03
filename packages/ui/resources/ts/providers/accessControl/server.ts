import type { CanParams, CanReturnType } from '@refinedev/core';
import { checkAccess, getAccess } from './access';
import type { AccessPayload } from './types';
import { canByPermission, permissionFor } from './permissions';

/**
 * Record-level checks that should be delegated to backend policies.
 *
 * Server mode performs one /me/access/check request per record so the UI
 * matches backend policies exactly. React Query caches each result.
 *
 * Alternatives considered:
 * 1. Render by permission only and check on click: fewer requests, but the
 *    UI may show actions that the backend later rejects.
 * 2. Batch /me/access/check for multiple IDs: more efficient for large
 *    tables, but requires a batch endpoint and a more complex provider.
 */
export const serverCan = async (
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
    (resource === 'users' || resource === 'login-histories') &&
    canParams?.id != null &&
    (action === 'show' ||
      action === 'edit' ||
      action === 'delete' ||
      action === 'update')
  ) {
    const can = await checkAccess(resource, action, canParams.id);

    return {
      can,
      reason: can
        ? undefined
        : 'You are not allowed to perform this action on this record.',
    };
  }

  return { can: true };
};
