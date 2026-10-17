import { DataProvider } from "@refinedev/core";
// import { httpRequest, generateSort, generateFilter } from "./utils";
import { KyInstance } from "ky";
import { httpRequest } from "./utils/httpRequest";
import i18n from "@/i18n";

// For support response type
// type ResponseType = 'json' | 'text' | 'blob' | 'formData' | 'arrayBuffer';

class CustomError extends Error {
  constructor(
    name: string,
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = name;
    // this.cause = cause;
  }
}

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";
type MethodCommons = "get" | "post" | "put" | "patch";

const buildQueryParams = (
  pagination?: {
    mode?: "server" | "client" | "off";
    currentPage?: any; // number | { cursor: string };
    pageSize?: number;
    meta?: Record<string, any>;
  },
  filters?: any[],
  sorters?: any[],
  searchParams?: Record<string, any>,
  q?: string,
  select?: string | string[],
  mode?: string,
) => {
  const withPagination = pagination && pagination.mode !== "off";
  const query: Record<string, any> = {
    mode: withPagination ? mode : "all",
    ...(searchParams ?? {})
  };

  if(withPagination){
    // 1. Support cursor pagination (cursor passed via meta or searchParams)
    const cursor = 
      pagination?.currentPage?.cursor ?? 
      pagination?.meta?.cursor ?? 
      searchParams?.cursor;

    if (cursor) {
      query.cursor = cursor;
    } else if (mode !== "all") {
      query.page = pagination?.currentPage ?? 1;
    }
    // query.page = pagination.currentPage ?? 1;

    query.perPage = pagination.pageSize ?? 10;
  }

  if(q) query.q = q;

  if(select){
    query.select = Array.isArray(select) 
      ? select.join(',') 
      : select; // select?.length ? select.replace(/ /g, '') : '';
  }

  // 2. Format filters
  filters?.forEach(filter => {
    if(
      !filter?.field ||
      filter?.value == null ||
      filter?.value === ''
    ){
      return;
    }
    query[`filter[${filter.field}]`] = filter.value;
  });

  // 3. Format sorters
  if(sorters?.length){
    query.sort = sorters.map(item => 
      item.order === "desc"
        ? '-' + item.field
        : item.field
    )
    .join(",");
  }

  // Option: Clean out undefined/null/empty keys for Ky
  for (const key in query) {
    if (query[key] == null) {
      delete query[key];
    }
  }

  return query;
};

const parseApiResponse = (
  response: any,
  paginationOff: boolean
) => {
  if(!response?.success){
    throw new CustomError(
      "ApiError",
      response?.message || i18n.t("error.unspecific"),
      response
    );
  }

  if(paginationOff){
    return response;
  }

  const data = response.data ?? [];

  // console.log('response:', response);

  return {
    ...response,
    data,
    total: response.meta.total ?? data.length ?? 0,
  };
};

export const dataProvider = (
  apiUrl: string,
  httpClient: KyInstance = httpRequest as unknown as KyInstance
): DataProvider => ({
  getList: async ({ 
    resource, 
    pagination, // : { currentPage = 1, pageSize = 10, mode = "server" } = {}, 
    filters, 
    sorters, 
    meta: { method, queryContext, searchParams, q, select, mode, ...requestOptions } = {}
  }) => {
    const response: any = await httpRequest(resource, {
      method: (method as MethodCommons) ?? "get",
      signal: queryContext?.signal,
      ...requestOptions,
      searchParams: buildQueryParams(
        pagination,
        filters,
        sorters,
        searchParams,
        q,
        select,
        mode
      ),
    }).json();

    return parseApiResponse(response, pagination?.mode === "off");
  },

  // getMany: async ({ 
  //   resource, 
  //   ids, 
  //   meta: { method, queryContext, searchParams, ...requestOptions } = {}
  // }) => {
  //   try {
  //     const response: any = await httpClient(
  //       resource, 
  //       { 
  //         ...requestOptions,
  //         method: (method as MethodTypes) ?? "get",
  //         signal: queryContext?.signal, 
  //         searchParams: { ...searchParams, id: ids }, 
  //       }
  //     )
  //     .json();
      
  //     if(response?.success){
  //       return response;
  //     }

  //     throw new CustomError(
  //       'ReadError', 
  //       response?.message || i18n.t('error.unspecific'), 
  //       response
  //     );
  //   } catch(err){
  //     throw err;
  //   }
  // },

  create: async ({ 
    resource, 
    variables, 
    meta: { method, body, ...requestOptions } = {}
  }) => {
    const requestMethod = (method as MethodCommons) ?? "post"; // MethodTypesWithBody | MethodCommons

    const response: any = await httpClient(
      resource,
      {
        ...requestOptions,
        method: requestMethod,
        body,
        json: requestMethod === 'get' || body ? undefined : variables,
      }
    ).json(); // [responseType as ResponseType || "json"](); // For Support response type

    // console.log('create response:', response);

    if(response?.success){
      return response;
      
      /**
       * @DEV : Not work...!!!
       * How Refine Actually Works
       * dataProvider.create()  →  returns { data }  →  Refine ignores successNotification here
       * useCreate({ successNotification })          →  Refine reads successNotification HERE only
       */
      // if(response.message){
      //   response.successNotification = {
      //     type: "success",
      //     message: response.message
      //   };
      // }
      // return response;
    }

    /**
     * For Support response type
     */
    // if(
    //   response?.success || 
    //   (responseType === 'blob' && response instanceof Blob)
    // ){
    //   return response;
    // }

    throw new CustomError(
      'CreateError', 
      response?.message || i18n.t('error.unspecific'), 
      response
    );
    // Error normalization (disabled — errors propagate unchanged):
    // throw {
    //   message: err?.message || i18n.t('error.unspecific'),
    //   statusCode: err?.statusCode || 500,
    //   errors: err?.data?.errors || {}
    // };
  },

  update: async ({ 
    resource, 
    id, 
    variables, 
    meta: { method, ...requestOptions } = {}
  }) => {
    const response: any = await httpClient(
      resource + (id ? '/' + id : ''),
      {
        ...requestOptions,
        method: (method as MethodTypesWithBody) ?? "put",
        json: variables,
      }
    ).json();

    // console.log('update response:', response);

    if(response?.success){
      return response;
    }
    
    throw new CustomError(
      'UpdateError', 
      response?.message || i18n.t('error.unspecific'), 
      response
    );
  },

  getOne: async ({ 
    resource, 
    id, 
    meta: { method, queryContext, ...requestOptions } = {}
  }) => {
    const response: any = await httpClient(
      resource + (id ? '/' + id : ''),
      { 
        ...requestOptions,
        method: (method as MethodTypes) ?? "get",
        signal: queryContext?.signal,
      }
    ).json();

    if(response?.success){
      return response;
    }
    
    throw new CustomError(
      'ReadError', 
      response?.message || i18n.t('error.unspecific'), 
      response
    );
  },
  
  deleteOne: async ({ 
    resource, 
    id, 
    variables, 
    meta: { method, ...requestOptions } = {}
  }) => {
    const response: any = await httpClient(
      resource + "/" + id,
      {
        ...requestOptions,
        method: (method as MethodTypesWithBody) ?? "delete",
        json: variables,
      }
    ).json();

    if(response?.success){
      return response;
    }
    
    throw new CustomError(
      'DeleteError', 
      response?.message || i18n.t('error.unspecific'), 
      response
    );
  },

  deleteMany: async ({ 
    resource, 
    ids, 
    meta: { method, ...requestOptions } = {}
    // variables
  }) => {
    const response: any = await httpClient(
      resource, 
      { 
        ...requestOptions,
        method: (method as MethodTypesWithBody) ?? "delete",
        json: { ids },
      }, // , variables
    ).json();

    if(response?.success){
      return response;
    }
    
    throw new CustomError(
      'DeleteManyError', 
      response?.message || i18n.t('error.unspecific'), 
      response
    );
  },

  getApiUrl: () => apiUrl,

  custom: async ({
    url,
    method,
    filters,
    sorters,
    meta: { 
      queryContext, 
      searchParams, 
      q, 
      select, 
      mode, 
      pagination, // : { currentPage = 1, pageSize = 10, mode = "server" } = {}, 
      ...requestOptions
    } = {},
  }) => {
    const response: any = await httpRequest(url, {
      method: (method as MethodCommons) ?? "get",
      signal: queryContext?.signal,
      ...requestOptions,
      searchParams: buildQueryParams(
        pagination,
        filters,
        sorters,
        searchParams,
        q,
        select, 
        mode
      ),
    }).json();

    return parseApiResponse(response, pagination?.mode === "off");
  },
});
