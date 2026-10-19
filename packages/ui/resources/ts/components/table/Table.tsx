import { Table as AntTable } from "antd";
import type { TableProps as AntTableProps } from "antd";

export type TableProps<T = any> = AntTableProps<T>;

/**
 * antd Table with project defaults:
 * - size: "small"
 * - rowKey: "id"
 * - pagination: showSizeChanger + "x-y of N items" summary (or disabled when `pagination` is falsy)
 *
 * Consumer props win over the defaults, and an explicit `pagination` prop wins
 * over the injected `showSizeChanger`/`showTotal` (see the trailing spread).
 *
 * @docs https://ant.design/components/table
 */
export const Table = <T = any>({
  pagination,
  ...etc
}: TableProps<T>) => (
  <AntTable
    size="small"
    rowKey="id"
    {...etc}
    pagination={
      pagination
        ? {
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            ...pagination,
          }
        : false
    }
  />
);
