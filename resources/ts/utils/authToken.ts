// import Cookies from 'js-cookie';
import { getCookie } from "./browser";

// type cookieResult = string | undefined; //  | null

/**
 * 
 * @param tokenKey string
 * @returns string CSRF token | undefined
 */
export const getCsrfToken = (tokenKey: string = 'XSRF-TOKEN') => 
  getCookie(tokenKey); // Cookies.get(tokenKey)

