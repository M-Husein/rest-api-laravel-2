// import { User } from './index';

export {};

// type AppPageKind = "one" | "list" | "table" | "custom";

interface AppPagePayload<T = any> {
  /**
   * For endpoint/resource, 
   * used in:
   * resources\ts\utils\locale\i18nBackend.ts
   * Refine hooks such as useTable, useList, useOne
   */
  key: string | number | null;

  data?: T;

  /**
   * For locales data, e.g from endpoint /api/v1/locales/en/page/contact-us 
   */
  content?: T; // Record<string, any>

  meta?: Record<string, any>;
  // kind: AppPageKind;
  // resource?: string | null;
  // props?: Record<string, any>;
}

interface AppPayload {
  // locale?: string;
  user?: any; // User
  page?: AppPagePayload | null;
}

declare global {
  interface Window {
    __APP__: AppPayload;
  }
}
