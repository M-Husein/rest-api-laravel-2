import type { TableProps } from "antd";
import {
  useLiveMode,
  useTable as useCoreTable,
  type BaseRecord,
  type CrudFilter,
  type CrudSort,
  type HttpError,
  type LogicalFilter,
  type useTableProps as UseCoreTableProps,
  type useTableReturnType as UseCoreTableReturnType,
} from "@refinedev/core";

// All antd row types that risk changing when upgrading to antd v6 are
// consolidated in this file: the Table `onChange` parameters.
type TableOnChange = NonNullable<TableProps<BaseRecord>["onChange"]>;
type TableFiltersParam = Parameters<TableOnChange>[1];
type TableSorterParam = Parameters<TableOnChange>[2];

export type UseTableProps<
  TQueryFnData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  TData extends BaseRecord = TQueryFnData,
> = UseCoreTableProps<TQueryFnData, TError, TData>;

export type UseTableReturnType<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
> = UseCoreTableReturnType<TData, TError> & {
  tableProps: TableProps<TData>;
};

type sortType = { multiple?: number } | undefined;

/**
 * Port of `@refinedev/antd`'s `mapAntdSorterToCrudSorting`: honor
 * `column.sorter.multiple` for multi-sort ordering, use
 * `columnKey ?? field`, and drop entries without an order (e.g. a canceled sort).
 */
const mapAntdSorterToCrudSorting = (sorter: TableSorterParam): CrudSort[] => {
  const crudSorting: CrudSort[] = [];
  const list = Array.isArray(sorter) ? [...sorter] : [sorter];
  // The comparator is kept identical to the official one (not `a - b`)
  // so multi-sort priority stays exactly the same.
  list
    .sort((a, b) =>
      ((a?.column?.sorter as sortType)?.multiple ?? 0) <
      ((b?.column?.sorter as sortType)?.multiple ??
        0)
        ? -1
        : 0,
    )
    .forEach((item) => {
      if (item?.field && item.order) {
        const field = Array.isArray(item.field)
          ? item.field.join(".")
          : '' + item.field;
        crudSorting.push({
          field: `${item.columnKey ?? field}`,
          order: item.order.replace("end", "") as CrudSort["order"],
        });
      }
    });
  return crudSorting;
};

/**
 * Port of `@refinedev/antd`'s `mapAntdFilterToCrudFilter`: the operator is taken
 * from the previous filter for the same field (then from the initial filters),
 * defaulting to `in` (array) / `eq`.
 */
const mapAntdFilterToCrudFilter = (
  tableFilters: TableFiltersParam,
  prevFilters: CrudFilter[],
  initialFilters?: CrudFilter[],
): CrudFilter[] => {
  const crudFilters: CrudFilter[] = [];
  const mapInitialFilter: Record<string, CrudFilter> = (initialFilters ?? [])
    .filter((item) => "field" in item)
    .reduce(
      (acc, item) => ({ ...acc, [(item as LogicalFilter).field]: item }),
      {},
    );

  for (const field of Object.keys(tableFilters ?? {})) {
    const value = (tableFilters as Record<string, unknown>)[field];
    const prevOperator = prevFilters.find(
      (item) => "field" in item && item.field === field,
    )?.operator;
    const initialOperator = (
      mapInitialFilter[field] as LogicalFilter | undefined
    )?.operator;
    const operator = prevOperator ?? initialOperator;

    if (operator !== "or" && operator !== "and") {
      crudFilters.push({
        field,
        operator: (operator ??
          (Array.isArray(value) ? "in" : "eq")) as LogicalFilter["operator"],
        value: value as CrudFilter["value"],
      });
    }
  }
  return crudFilters;
};

/**
 * Replacement for `@refinedev/antd`'s `useTable`, free of antd dependencies
 * (safe for the antd v6 upgrade): all table state, URL sync, and querying are
 * delegated to the core `useTable` — this file is only a `tableProps` adapter.
 *
 * The return object uses the exact official names (`currentPage`/`setCurrentPage`, ...)
 * so consumers only need to change their import line.
 */
export const useTable = <
  TQueryFnData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  TData extends BaseRecord = TQueryFnData,
>(
  props?: UseTableProps<TQueryFnData, TError, TData>,
): UseTableReturnType<TData, TError> => {
  const {
    tableQuery,
    sorters,
    setSorters,
    filters,
    setFilters,
    createLinkForSyncWithLocation,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    pageCount,
    result,
    overtime,
  } = useCoreTable<TQueryFnData, TError, TData>(props);

  const liveMode = useLiveMode(props?.liveMode);
  const paginationOff = props?.pagination?.mode === "off";
  const initialFilters = props?.filters?.initial;

  const { data, isFetched, isLoading } = tableQuery;

  const onChange: TableProps<TData>["onChange"] = (
    paginationState,
    tableFilters,
    sorter,
  ) => {
    if (tableFilters && Object.keys(tableFilters).length > 0) {
      setFilters(
        mapAntdFilterToCrudFilter(
          tableFilters as TableFiltersParam,
          filters,
          initialFilters,
        ),
      );
    }
    if (sorter && Object.keys(sorter).length > 0) {
      // The mapping result may be empty (canceled sort) — still set it so the
      // state stays clean, exactly like the official behavior.
      setSorters(mapAntdSorterToCrudSorting(sorter as TableSorterParam));
    }
    if (!paginationOff) {
      setCurrentPage?.(paginationState.current || 1);
      setPageSize?.(paginationState.pageSize || 10);
    }
  };

  const tableProps: TableProps<TData> = {
    dataSource: data?.data,
    loading: liveMode === "auto" ? isLoading : !isFetched,
    onChange,
    pagination: paginationOff
      ? false
      : {
          current: currentPage,
          pageSize,
          total: data?.total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          onShowSizeChange: (_page, size) => {
            setCurrentPage(1);
            setPageSize(size);
          },
        },
    scroll: { x: true },
  };

  return {
    tableQuery,
    sorters,
    setSorters,
    filters,
    setFilters,
    createLinkForSyncWithLocation,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    pageCount,
    result,
    overtime,
    tableProps,
  };
};
