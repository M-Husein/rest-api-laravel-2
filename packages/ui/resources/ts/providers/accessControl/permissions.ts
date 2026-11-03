import type { AccessPayload } from './types';

/**
 * Backend permission key for a Refine resource/action.
 *
 * NOTE: `articles` still points to the public /articles page in the sidebar.
 * It is intended to become an admin CRUD route (/app/articles) with
 * articles.view/create/update/delete permissions. Route mapping is not
 * implemented yet, so this entry is intentionally left ungated for now.
 */
export const RESOURCE_PERMISSIONS: Record<string, string | null> = {
  home: 'admin.access',
  users: 'users.view',
  contacts: 'contacts.view',
  articles: null,
  app: 'admin.access',
  settings: null,
  devs: 'admin.access',
  currency: 'admin.access',
  country: 'admin.access',
  province: 'admin.access',
  city: 'admin.access',
};

/**
 * Refine action -> backend ability/permission for a resource.
 */
export const ACTION_PERMISSIONS: Record<string, Record<string, string>> = {
  users: {
    list: 'users.view',
    show: 'users.view',
    create: 'users.create',
    edit: 'users.update',
    update: 'users.update',
    delete: 'users.delete',
    clone: 'users.create',
    restore: 'users.restore',
    force_delete: 'users.force_delete',
    delete_any: 'users.delete',
  },
  'login-histories': {
    list: 'login_histories.view',
    show: 'login_histories.view',
    delete: 'login_histories.delete',
    delete_any: 'login_histories.delete',
  },
  articles: {
    list: 'articles.view',
    show: 'articles.view',
    create: 'articles.create',
    edit: 'articles.update',
    update: 'articles.update',
    delete: 'articles.delete',
    publish: 'articles.publish',
  },
  contacts: {
    list: 'contacts.view',
    show: 'contacts.view',
    create: 'contacts.create',
    edit: 'contacts.update',
    update: 'contacts.update',
    delete: 'contacts.delete',
  },
  app: {
    list: 'admin.access',
  },
};

export const permissionFor = (
  resource: string | undefined,
  action: string,
): string | null => {
  if (!resource) {
    return null;
  }

  const resourcePermissions = ACTION_PERMISSIONS[resource];

  if (resourcePermissions) {
    return resourcePermissions[action] ?? null;
  }

  return RESOURCE_PERMISSIONS[resource] ?? null;
};

export const canByPermission = (
  access: AccessPayload | null | undefined,
  permission: string | null,
): boolean => {
  if (!permission) {
    return true;
  }

  if (!access) {
    return false;
  }

  if (access.preset === 'none') {
    return true;
  }

  if (access.preset === 'simple') {
    return access.roles.includes('Admin');
  }

  return access.permissions.includes(permission);
};
