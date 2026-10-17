import type { CrudSort } from "@refinedev/core";

export type AntdSortOrder = "ascend" | "descend" | undefined;

/**
 * The antd-specific part of `getDefaultSortOrder`: the core only knows
 * "asc"/"desc", whereas antd Table's `sortOrder` prop requires
 * "ascend"/"descend" (i.e. the order plus the "end" suffix, exactly like the
 * `@refinedev/antd` helper).
 *
 * Used in column definitions: `sortOrder: getDefaultSortOrder(key, sorter)`.
 * When no sorter matches, the function falls through to the end and returns
 * `undefined` (an uncontrolled column) — written as an implicit return to keep
 * the file lean. An enabled `noImplicitReturns` does NOT change runtime
 * behavior, it only makes tsc reject this pattern.
 *
 * If `noImplicitReturns: true` is enabled in tsconfig, add an explicit return:
 * ```ts
 * if (found?.order) return found.order + 'end' as AntdSortOrder;
 * return undefined;
 * ```
 */
export const getDefaultSortOrder = (
  columnName: string,
  sorter?: CrudSort[],
): AntdSortOrder => {
  const found = sorter?.find(item => item.field === columnName);

  if (found?.order) return found.order + 'end' as AntdSortOrder;
};
