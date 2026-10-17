import ky, { isHTTPError } from 'ky';
import { getCsrfToken } from '@/utils/authToken';
import { zoneStrategy } from "@/i18n/factory";

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

/**
 * ky options for retry on server errors only
 */
export const retryOnServerErrors: any = {
  limit: 2,
  methods: ['get'],
  // Server errors code
  statusCodes: [408, 429, 500, 502, 503, 504],
};

export const refreshCsrfToken = async (): Promise<void> => {
  await ky.get('/sanctum/csrf-cookie', {
    credentials: 'include',
    retry: retryOnServerErrors,
  });
}

/**
 * Base instance
 * Used for public endpoints — no credentials, no session cookie
 */
export const api = ky.create({
  prefix: APP.api, // '/api/v1'
  retry: 0,
  timeout: APP.timeout,
  // headers: {
  //   'Accept-Language': getCurrentLang(), // Not support SPA, need reload browser
  //   // Accept: 'application/json',
  // },
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        /**
         * Attach CSRF token header on every mutating request.
         */
        if (
          request.credentials !== 'omit' &&
          MUTATING_METHODS.includes(request.method.toUpperCase())
        ) {
          // let csrfToken = getCsrfToken();
          // if (csrfToken) {
          //   request.headers.set('X-XSRF-TOKEN', csrfToken);
          // }

          /**
           * @OR
           */

          let csrfToken = getCsrfToken();

          // Auto-fetch if cookie not yet set
          if (!csrfToken) {
            await refreshCsrfToken();
            csrfToken = getCsrfToken();
          }

          if (csrfToken) {
            request.headers.set('X-XSRF-TOKEN', csrfToken);
          }
        }
        
        /**
         * Attach Accept-Language header from i18n setting.
         */
        request.headers.set('Accept-Language', zoneStrategy().getRequestHeaders()['Accept-Language']);
      }
    ],
    beforeError: [
      async ({ error }) => {
        // Error normalizer — extracts message and body from JSON or text responses
        if (isHTTPError(error)) {
          const { response } = error;

          if (response.headers.get('content-type')?.includes('application/json')) {
            // Ky v2 might have already parsed the body into error.data
            const body: any = error.data ?? await response.json();
            error.message = body.message ?? response.statusText;
            // @ts-expect-error - ky HTTPError typed without these; assigned for downstream consumers
            error.status = response.status;
            // @ts-expect-error - ky HTTPError typed without these; assigned for downstream consumers
            error.statusCode  = response.status;
            error.data = body;
          } else {
            error.message = await response.text();
          }
        }
        return error;
      }
    ],
  },
});

/**
 * Authenticated instance
 * Used for all protected /api/* endpoints.
 * Sends session cookie automatically — no Bearer token needed for SPA.
 */
export const httpRequest = api.extend({
  credentials: 'include', // sends session cookie on every request
  hooks: {
    afterResponse: [
      async ({ request, response }) => {
        /**
         * Auto-refresh CSRF token and retry original request on 419.
         * Uses raw ky (not http instance) to avoid infinite recursion.
         */
        if (response.status === 419) {
          // raw ky inside — no recursion risk
          await refreshCsrfToken();

          const csrfToken = getCsrfToken();
          if (csrfToken) {
            request.headers.set('X-XSRF-TOKEN', csrfToken);
          }
          // retry original request with new CSRF token
          return ky(request);
        }
      }
    ],
  },
});
