import type { BaseKey, CanReturnType } from '@refinedev/core';

export type RbacPresetName = 'simple' | 'standard' | 'advanced' | 'none';

export type RbacUiMode = 'client' | 'server';

export interface AccessPayload {
  preset: RbacPresetName;
  ui_mode: RbacUiMode | null;
  user_id: BaseKey | null;
  roles: string[];
  permissions: string[];
  is_admin: boolean;
}

export interface AccessCheckPayload {
  resource: string;
  action: string;
  id?: BaseKey | null;
}

export type AccessResult = CanReturnType;
