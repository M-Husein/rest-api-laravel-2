import { getCookie } from "./browser";

/**
 * 
 * @param tokenKey string
 * @returns string CSRF token | undefined
 */
export const getCsrfToken = (tokenKey: string = 'XSRF-TOKEN') => 
  getCookie(tokenKey);
