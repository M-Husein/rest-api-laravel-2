import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { CanParams } from '@refinedev/core';

(globalThis as any).APP = { rbac: 'advanced' };

vi.mock('@/providers/dataProvider', () => ({
  httpRequest: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { httpRequest } from '@/providers/dataProvider';
import { getAccess, clearAccess, checkAccess } from '@/providers/accessControl/access';
import { clientCan } from '@/providers/accessControl/client';
import { serverCan } from '@/providers/accessControl/server';
import { shouldEnableAccessControl } from '@/providers/accessControl';

const accessPayload = {
  preset: 'advanced',
  ui_mode: 'server',
  user_id: 1,
  roles: ['Admin'],
  permissions: ['users.view', 'users.delete'],
  is_admin: true,
};

const memberPayload = {
  preset: 'advanced',
  ui_mode: 'server',
  user_id: 2,
  roles: ['Member'],
  permissions: ['login_histories.view_own'],
  is_admin: false,
};

const mockJson = (data: any) =>
  Promise.resolve({ json: async () => ({ success: true, data }) });

beforeEach(() => {
  clearAccess();
  vi.resetAllMocks();
  (globalThis as any).APP = { rbac: 'advanced' };
});

describe('getAccess', () => {
  it('returns cached access payload', async () => {
    vi.mocked(httpRequest.get).mockResolvedValueOnce(mockJson(accessPayload));

    const first = await getAccess();
    const second = await getAccess();

    expect(second).toEqual(first);
    expect(httpRequest.get).toHaveBeenCalledTimes(1);
  });

  it('throws when access payload is invalid', async () => {
    vi.mocked(httpRequest.get).mockResolvedValueOnce(
      Promise.resolve({ json: async () => ({ success: false, data: null }) }),
    );

    await expect(getAccess()).rejects.toThrow();
  });
});

describe('checkAccess', () => {
  it('returns can true', async () => {
    vi.mocked(httpRequest.post).mockResolvedValueOnce(mockJson({ can: true }));

    const can = await checkAccess('users', 'delete', 2);

    expect(can).toBe(true);
    expect(httpRequest.post).toHaveBeenCalledWith('me/access/check', {
      json: { resource: 'users', action: 'delete', id: 2 },
    });
  });

  it('returns can false', async () => {
    vi.mocked(httpRequest.post).mockResolvedValueOnce(mockJson({ can: false }));

    const can = await checkAccess('users', 'delete', 2);

    expect(can).toBe(false);
  });

  it('returns false on request error', async () => {
    vi.mocked(httpRequest.post).mockRejectedValueOnce(new Error('network'));

    const can = await checkAccess('users', 'delete', 2);

    expect(can).toBe(false);
  });
});

describe('shouldEnableAccessControl', () => {
  it('returns false for none', () => {
    (globalThis as any).APP = { rbac: 'none' };
    expect(shouldEnableAccessControl()).toBe(false);
  });

  it('returns true for advanced', () => {
    (globalThis as any).APP = { rbac: 'advanced' };
    expect(shouldEnableAccessControl()).toBe(true);
  });
});

describe('clientCan', () => {
  it('allows admin for users.view', async () => {
    vi.mocked(httpRequest.get).mockResolvedValueOnce(mockJson(accessPayload));

    const params: CanParams = { resource: 'users', action: 'view' };
    expect(await clientCan(params)).toEqual({ can: true });
  });

  it('denies member for users.delete', async () => {
    vi.mocked(httpRequest.get).mockResolvedValueOnce(mockJson(memberPayload));

    const params: CanParams = { resource: 'users', action: 'delete', params: { id: 3 } };
    expect(await clientCan(params)).toEqual({ can: false });
  });

  it('denies self-delete for advanced client', async () => {
    vi.mocked(httpRequest.get).mockResolvedValueOnce(mockJson({ ...accessPayload, user_id: 1 }));

    const params: CanParams = { resource: 'users', action: 'delete', params: { id: 1 } };
    expect(await clientCan(params)).toEqual({ can: false, reason: 'You cannot delete your own account.' });
  });

  it('allows member to view own login history', async () => {
    vi.mocked(httpRequest.get).mockResolvedValueOnce(mockJson(memberPayload));

    const params: CanParams = {
      resource: 'login-histories',
      action: 'show',
      params: { record: { user_id: 2 } },
    };
    const result = await clientCan(params);
    expect(result.can).toBe(true);
  });

  it('denies member to view other login history', async () => {
    vi.mocked(httpRequest.get).mockResolvedValueOnce(mockJson(memberPayload));

    const params: CanParams = {
      resource: 'login-histories',
      action: 'show',
      params: { record: { user_id: 3 } },
    };
    expect(await clientCan(params)).toEqual({ can: false, reason: 'You can only view your own login history.' });
  });
});

describe('serverCan', () => {
  it('allows admin to delete other user', async () => {
    vi.mocked(httpRequest.get).mockResolvedValueOnce(mockJson(accessPayload));
    vi.mocked(httpRequest.post).mockResolvedValueOnce(mockJson({ can: true }));

    const params: CanParams = { resource: 'users', action: 'delete', params: { id: 2 } };
    expect(await serverCan(params)).toEqual({ can: true });
  });

  it('denies self-delete for advanced server', async () => {
    vi.mocked(httpRequest.get).mockResolvedValueOnce(mockJson({ ...accessPayload, user_id: 1 }));

    const params: CanParams = { resource: 'users', action: 'delete', params: { id: 1 } };
    const result = await serverCan(params);
    expect(result.can).toBe(false);
  });

  it('allows member to view own login history via backend check', async () => {
    vi.mocked(httpRequest.get).mockResolvedValueOnce(mockJson(memberPayload));
    vi.mocked(httpRequest.post).mockResolvedValueOnce(mockJson({ can: true }));

    const params: CanParams = {
      resource: 'login-histories',
      action: 'show',
      params: { id: 5 },
    };
    expect(await serverCan(params)).toEqual({ can: true });
  });
});
