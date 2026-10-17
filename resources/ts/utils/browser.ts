import { isMobile } from '@/utils/checking';

export interface OpenWindowParams {
  url: string;
  title: string;
  width: number;
  height: number;
  onClose?: () => void;
}

/**
 * Opens a centered popup on desktop, or a new tab on mobile.
 *
 * On desktop, the popup is centered relative to the screen and focused.
 * On mobile, it opens a new tab (since popups are often blocked or ignored).
 *
 * The `onClose` callback works on both desktop and mobile (polling `closed`).
 *
 * @param {OpenWindowParams} params - Configuration object.
 * @returns {Window|null} Reference to the opened window/tab, or `null` if blocked.
 *
 * @example
 * openWindow({
 *   url: "https://example.com/auth",
 *   title: "Login",
 *   width: 600,
 *   height: 700,
 *   onClose: () => console.log("Window closed"),
 * });
 */
export const openWindow = ({
  url,
  title,
  width,
  height,
  onClose,
}: OpenWindowParams): Window | null | undefined => {
  let newWindow: Window | null | undefined;

  // Mobile detection
  if (isMobile()) {
    // On mobile: open a new tab (no features)
    newWindow = window.open(
      url, 
      '_blank'
      /**
       * Optional for security, 
       * in chrome if use this option message:
       * Cross-Origin-Opener-Policy policy would block the window.closed call.
       * will not show, but return this function can be null
       */
      // 'noopener'
    );
  } else {
    // On desktop: open a centered popup
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;

    const screenWidth = window.screen.width || window.innerWidth || document.documentElement.clientWidth;
    const screenHeight = window.screen.height || window.innerHeight || document.documentElement.clientHeight;

    const systemZoom = screenWidth / window.screen.availWidth;
    const left = (screenWidth - width) / 2 / systemZoom + dualScreenLeft;
    const top = (screenHeight - height) / 2 / systemZoom + dualScreenTop;

    /*
      [
        'scrollbars=yes',
        `width=${width}`,
        `height=${height}`,
        `top=${top}`,
        `left=${left}`,
        // 'noopener', // optional for security
      ].join(',')
    */

    newWindow = window.open(
      url, 
      title, 
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );
  }

  // Common post-open handling
  if (newWindow) {
    newWindow.focus();

    // Optional close detection (works for both tabs and popups)
    if (typeof onClose === 'function') {
      const timer = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(timer);
          onClose();
        }
      }, 500);
    }
  }

  return newWindow;
};

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Retrieves the value of a cookie by its name.
 * @param name - The name of the cookie to retrieve.
 *@returns The decoded cookie value as a string, or `undefined` if the cookie
 *         does not exist or is not visible to the current page.
 */
export const getCookie = (name: string): string | undefined => { //  | null
  let cookieValue: string | undefined | null = document.cookie;
  
  if(!cookieValue) return;

  // To support cookie name with special character such as [ ] etc
  cookieValue = cookieValue
    .split('; ')
    .find(row => row.startsWith(name + '='));

  // Cookie doesn't exist
  if(!cookieValue) return;

  // Takes everything after the first "="
  cookieValue = cookieValue.substring(name.length + 1);

  return cookieValue && decodeURIComponent(cookieValue);
  
  // // Matches the cookie name followed by '=' and captures everything up to the next ';'
  // let cookieValue = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));

  // // return cookieValue && decodeURIComponent(cookieValue[2]);

  // if (cookieValue) {
  //   return decodeURIComponent(cookieValue[2]); // cookieValue[2]
  // }

  // Option: Returns null if the cookie doesn't exist
  // return null;
};

/**
 * Sets a cookie with flexible options.
 *
 * This function encodes the value using `encodeURIComponent` and provides
 * full control over expiration, path, domain, secure, and SameSite attributes.
 * If no `expires` option is provided, a session cookie is created.
 *
 * @param name - The name of the cookie.
 * @param value - The value to store. It will be URI-encoded automatically.
 * @param options - Optional configuration object for the cookie.
 * @param options.expires - Expiration as a `number` of days or a `Date` object.
 *                          Omit for a session cookie.
 * @param options.path - The path where the cookie is accessible. Defaults to `'/'`.
 * @param options.domain - The domain where the cookie is accessible.
 * @param options.secure - If `true`, the cookie is only sent over HTTPS. Defaults to `false`.
 * @param options.sameSite - SameSite attribute ('strict', 'lax', 'none'). Defaults to not set.
 *
 * @throws {Error} If the value exceeds the browser's maximum cookie size (~4KB).
 */
export const setCookie = (
  name: string, 
  value: string, 
  options?: CookieOptions
): void => {
  // Start with name=value and the mandatory path (defaults to '/')
  let cookieString = `${name}=${encodeURIComponent(value)}; path=${options?.path ?? '/'}`;

  // Expiration
  if (options?.expires != null) {
    const expirationDate =
      typeof options.expires === 'number'
        ? new Date(Date.now() + options.expires * 86400000) // days → milliseconds
        : options.expires;
    cookieString += '; expires=' + expirationDate.toUTCString();
  }

  // Domain (optional)
  if (options?.domain) {
    cookieString += '; domain=' + options.domain;
  }

  if (options?.secure) cookieString += '; secure';

  if (options?.sameSite) {
    const sameSite = options.sameSite.toLowerCase() as 'strict' | 'lax' | 'none';
    cookieString += '; samesite=' + sameSite;
    
    // Auto-add Secure for None
    if (sameSite === 'none' && !options.secure) {
      cookieString += '; secure';
    }
  }

  document.cookie = cookieString;
};

/**
 * Deletes a cookie by immediately expiring it.
 * 
 * * ⚠️ **Important:** To successfully delete a cookie, the `path`, `domain`,
 * `secure`, and `sameSite` options must **exactly match** the values used
 * when the cookie was originally set. If they don't match, the browser will
 * not find the cookie and the deletion will silently fail.
 *
 * @param name - The name of the cookie to delete.
 * @param options - The exact options that were used when setting the cookie.
 * @param options.path - The path the cookie was set on. Defaults to `'/'`.
 * @param options.domain - The domain the cookie was set on (if any).
 * @param options.secure - The secure flag used when setting the cookie.
 * @param options.sameSite - The SameSite attribute used when setting the cookie.
 */
export const deleteCookie = (
  name: string,
  options?: Pick<CookieOptions, 'path' | 'domain' | 'secure' | 'sameSite'>
): void => {
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${options?.path ?? '/'}`;
  
  if (options?.domain) cookieString += '; domain=' + options.domain;
  
  if (options?.secure) cookieString += '; secure';

  if (options?.sameSite) {
    cookieString += '; samesite=' + options.sameSite.toLowerCase();
  }
  
  document.cookie = cookieString;
};

export const getQueryParam = (key?: string) => {
  const query = new URLSearchParams(window.location.search);
  return key ? query.get(key) : query;
};

// export const getCurrentLang = () => 
//   getQueryParam('lang') || localStorage.getItem("i18nextLng") || APP.defaultLang;

export const localeRegex = new RegExp(`^\\/(${Object.keys(APP.locales).join('|')})(?=\\/|$)`);

export const getCurrentLang = (withAdmin: boolean = false) => {
  const currentPath = window.location.pathname;

  if(!currentPath.startsWith('/app')){
    return currentPath.match(localeRegex)?.[1] || "";
  }

  if(withAdmin) return "";

  return localStorage.getItem("i18nextLng") || ""; // || APP.defaultLang
};

export const changeUrlLang = (lang: string, currentPath: string) => {
  // Reload binds new Laravel localization headers
  // window.location.replace(currentPath.match(localeRegex) 
  //   ? currentPath.replace(localeRegex, "/" + lang)
  //   : "/" + lang + currentPath
  // );

  window.location.replace(
    currentPath.match(localeRegex) 
      ? currentPath.replace(localeRegex, lang !== APP.defaultLang ? "/" + lang : "")
      : "/" + lang + currentPath
  );
};

export const getMeta = async () => {
  /**
   * Optimize referrer to save database bytes and ensure privacy compliance
   */
  let referrerHost = '';
  const docReferrer = document.referrer;
  if (docReferrer) {
    try {
      referrerHost = new URL(docReferrer).hostname;
    } catch {
      referrerHost = docReferrer; 
    }
  }

  // Comprehensive Display Mode detection (Added spec-compliant space after colon)
  const supportedModes = ['fullscreen', 'standalone', 'minimal-ui', 'window-controls-overlay', 'borderless'];
  const currentDisplayMode = supportedModes.find(mode => window.matchMedia(`(display-mode: ${mode})`).matches) || 'browser';

  const windowInnerWidth = window.innerWidth;
  const windowInnerHeight = window.innerHeight;

  // Calculate orientation safely
  const orientationType = window.screen.orientation?.type;
  const currentOrientation = orientationType 
    ? (orientationType.includes('portrait') ? 'portrait' : 'landscape')
    : (windowInnerWidth > windowInnerHeight ? 'landscape' : 'portrait');

  const metas: Record<string, any> = {
    // Human-readable page identifier for clean dashboard charts
    pageTitle: document.title,
    location: {
      path: window.location.pathname,
    },
    navigator: {
      userAgent: navigator.userAgent,
      cookiesEnabled: navigator.cookieEnabled,
      maxTouchPoints: navigator.maxTouchPoints,
      hardwareConcurrency: navigator.hardwareConcurrency,
    },
    locale: {
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    display: {
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${windowInnerWidth}x${windowInnerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light",
      displayMode: currentDisplayMode,
      orientation: currentOrientation,
      // Detects if the app fired from an inactive/background browser tab
      visibility: document.visibilityState,
      // Perfect for verifying RTL layout stability in your i18n setup
      dir: document.dir || 'ltr', // textDirection
      hasOnTouchStart: 'ontouchstart' in window,
    },
    deviceId: getDeviceId(),
  };

  // Search params:
  const locationSearch = window.location.search;
  if(locationSearch){
    const searchParams = Object.fromEntries(new URLSearchParams(locationSearch));
    if(Object.values(searchParams).some(Boolean)){
      metas.location.search = locationSearch; // searchParams;
    }
  }

  // Keeps storage footprint tight while capturing SPA hashes
  const locationHash = window.location.hash;
  if(locationHash){
    metas.location.hash = locationHash;
  }

  // Marketing / Referrer
  if (referrerHost) {
    metas.referrer = referrerHost;
  }

  // Locale: Capture Active App Language safely (Your elegant i18next SPA refactor)
  let appLang = document.documentElement.lang;
  try {
    appLang = localStorage.getItem('i18nextLng') || appLang;
  } catch {
    // Silently retain document.documentElement.lang if storage is blocked
  }
  if (appLang) {
    metas.locale.appLanguage = appLang;
  }

  // Capture Multi-Monitor setup safely if supported
  const isExtended = (window.screen as any).isExtended;
  if(typeof isExtended == 'boolean'){
    metas.display.isMultiMonitor = isExtended;
  }

  // Locale fallback for multiple browser languages
  const navigatorLanguages = navigator.languages;
  if(navigatorLanguages?.length){
    metas.locale.languages = navigatorLanguages;
  }

  // Hardware: Device Memory
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory) {
    metas.navigator.deviceMemory = deviceMemory;
  }

  // Network:
  const conn = (navigator as any).connection;
  if (conn) {
    metas.navigator.connection = {
      effectiveType: conn.effectiveType,  // '4g', '3g'
      downlink: conn.downlink,            // Mbps
      rtt: conn.rtt,                      // ms
      saveData: conn.saveData             // boolean
    };
  }

  // Async High-Entropy User Agent Data
  const uaData = (navigator as any).userAgentData;
  if (uaData) {
    try {
      metas.navigator.userAgentData = await uaData.getHighEntropyValues([
        'architecture',     // x86, arm
        'bitness',          // 32, 64
        'model',            // Device model on mobile
        'platformVersion',  // OS version
        'fullVersionList',  // Exact browser build versions
        'formFactor',       // "Desktop", "Tablet", "XR", etc.
        'wow64',            // 32-bit browser on 64-bit Windows
      ]);
    } catch {
      metas.navigator.userAgentData = uaData.toJSON();
    }
  }

  return metas;
};

/**
 * Initializes or retrieves a persistent device/browser identifier.
 * This function attempts to read an existing identifier from `localStorage`
 * and a cookie, synchronizes them if they conflict, and generates a new one
 * if neither exists. The identifier is stored in both `localStorage` and a
 * cookie for redundancy, ensuring it survives if one storage layer is cleared.
 *
 * The cookie is set with the following security defaults:
 * - Expires in 365 days (1 year)
 * - Path: '/' (accessible across the entire site)
 * - Secure: Automatically enabled if the page is served over HTTPS
 * - SameSite: 'lax' (CSRF protection while allowing top-level navigation)
 *
 * @param key - The storage key used for both `localStorage` and the cookie.
 *              Defaults to `'deviceId'`.
 * @returns The synchronized device identifier as a string.
 */
export const getDeviceId = (key: string = 'deviceId'): string => {
  const lsId = localStorage.getItem(key);
  const cookieId = getCookie(key);

  // Scenario 1: Both exist and match (Happy path) - JUST RETURN IT
  if (lsId && cookieId && lsId === cookieId) {
    // console.log(`Device ID matches across storage.`);
    return lsId;
  }

  // Cookie options
  const cookieOptions = {
    expires: 365,
    path: '/',
    // OMITTED – let the browser default to the current hostname
    // domain: window.location.hostname,
    secure: window.location.protocol === 'https:',
    sameSite: 'lax' as const,
  };

  let finalId: string;

  // Scenario 2: Conflict (Both exist but differ) - localStorage wins
  if (lsId && cookieId && lsId !== cookieId) {
    // console.warn(`Device ID conflict. Overwriting cookie with localStorage.`);
    deleteCookie(key, cookieOptions);
    setCookie(key, lsId, cookieOptions);
    finalId = lsId;
  }
  // Scenario 3: localStorage exists, cookie missing - Restore cookie
  else if (lsId && !cookieId) {
    // console.log(`Restoring cookie from localStorage.`);
    setCookie(key, lsId, cookieOptions);
    finalId = lsId;
  }
  // Scenario 4: localStorage missing, cookie exists - Restore localStorage
  else if (!lsId && cookieId) {
    // console.log(`Restoring localStorage from cookie.`);
    localStorage.setItem(key, cookieId);
    finalId = cookieId;
  }
  // Scenario 5: Neither exists - Generate new
  else {
    // console.log(`First visit. Generating new Device ID.`);
    finalId = crypto.randomUUID();
    localStorage.setItem(key, finalId);
    setCookie(key, finalId, cookieOptions);
  }

  return finalId;
};

interface StorageEstimate {
  // Raw bytes (for precise calculations)
  usageBytes: number;
  quotaBytes: number | null;
  
  // Megabytes (rounded to 2 decimals, for easy display)
  usageMB: number;
  quotaMB: number | null;
  
  // Usage percentage (0-100) or null if quota is unknown
  percentageUsed: number | null;
  
  // Human-readable strings (e.g., "2.5 MB", "1.2 GB")
  formattedUsage: string;
  formattedQuota: string;
}

export const checkStorageSpace = async (): Promise<StorageEstimate | null> => {
  // Feature detection
  if (!navigator.storage || typeof navigator.storage.estimate !== 'function') {
    console.warn('Storage Estimate API not supported in this browser.');
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    
    const usageBytes = estimate.usage ?? 0;
    const quotaBytes = estimate.quota ?? null;

    const MB = 1024 * 1024;
    const usageMB = usageBytes / MB;
    const quotaMB = quotaBytes !== null ? quotaBytes / MB : null;

    let percentageUsed = null;
    if (quotaBytes !== null && quotaBytes > 0) {
      percentageUsed = (usageBytes / quotaBytes) * 100;
    }

    const formatBytes = (bytes: number): string => {
      if (bytes < MB) return (bytes / 1024).toFixed(1) + ' KB';
      if (bytes < MB * 1024) return (bytes / MB).toFixed(1) + ' MB';
      return (bytes / (MB * 1024)).toFixed(1) + ' GB';
    };

    return {
      usageBytes,
      quotaBytes,
      usageMB: Math.round(usageMB * 100) / 100,
      quotaMB: quotaMB !== null ? Math.round(quotaMB * 100) / 100 : null,
      percentageUsed: percentageUsed !== null ? Math.round(percentageUsed * 100) / 100 : null,
      formattedUsage: formatBytes(usageBytes),
      formattedQuota: quotaBytes !== null ? formatBytes(quotaBytes) : 'Unlimited',
    };
  } catch {
    // console.error('Failed to retrieve storage estimate:', err);
    return null;
  }
};

/**
 * Requests persistent storage following best practices
 */
export const requestPersistentStorage = async () => {
  // 1. Feature detection
  if (!navigator.storage || typeof navigator.storage.persist !== 'function') {
    // console.warn('Storage Manager API not supported in this browser.');
    return false;
  }

  try {
    // 2. Check if it's already granted
    const isAlreadyPersisted = await navigator.storage.persisted();
    if (isAlreadyPersisted) {
      // console.log('Persistent storage already granted.');
      return true;
    }

    // 3. 🚀 Request persistence
    // Best practice: If this is called on page load, it won't block.
    // For higher grant rates in Chrome, call this inside a 'click' listener
    // (e.g., after the user clicks "Login" or "Save").
    const isGranted = await navigator.storage.persist();
    
    if (isGranted) {
      console.log('✅ Persistent storage granted.'); // Your data is protected from eviction.
    } else {
      // This is EXPECTED behavior on first visits. Use 'info' or silent.
      console.info('ℹ️ Persistent storage not granted.'); // App will use standard storage (which still works perfectly).
    }
    
    return isGranted;
  } catch (err) {
    // Catch any unexpected JS errors, but don't break the app.
    console.warn('Could not check storage persistence:', err);
    return false;
  }
};

type shareMethod = 'webShare' | 'copy' | 'window';

/**
 * Options for the shareLink function.
 */
interface ShareOptions {
  /**
   * Fallback behavior when Web Share API is unsupported or fails.
   * - 'copy': copy the URL to clipboard (default)
   * - 'window': open the URL in a new tab
   */
  fallback?: 'copy' | 'window';
  /**
   * Called on successful sharing via any method.
   * @param method - Which method succeeded ('webShare', 'copy', or 'window')
   */
  onSuccess?: (method: shareMethod) => void;
  /**
   * Called when an error occurs.
   * Note: user cancellation (AbortError) is ignored and does NOT trigger this.
   * @param error - The error object
   * @param method - The method that failed ('webShare' or the fallback method)
   */
  onError?: (error: unknown, method: shareMethod) => void;
}

/**
 * Shares a link using the Web Share API (if supported) with a fallback.
 * Provides callbacks for success and error handling.
 *
 * @param data - The share data (title, text, url).
 * @param options - Configuration and callbacks.
 * @returns A promise that resolves when the operation completes.
 */
export const shareLink = async (
  data: { title?: string; text?: string; url: string },
  { fallback = 'copy', onSuccess, onError }: ShareOptions = {}
): Promise<void> => {
  // Try Web Share API if available
  if (navigator.share) {
    try {
      await navigator.share(data);
      onSuccess?.('webShare');
      return;
    } catch (error) {
      // User cancelled – ignore silently and DO NOT fall back
      if ((error as Error).name === 'AbortError') {
        return; // Just return, don't continue
      }
      // For other errors (e.g., share failed for a different reason), 
      // continue to fallback
      onError?.(error, 'webShare');
    }
  }

  // Fallback
  try {
    if (fallback === 'copy') {
      // Check the return value from copyToClipboard
      const success = await copyToClipboard(data.url);
      // Failed to copy to clipboard
      if (!success) throw new Error('Copy failed');
      onSuccess?.('copy');
    } else {
      // Check if the popup was blocked
      const popup = window.open(data.url, '_blank', 'noopener,noreferrer');
      if (!popup) throw new Error('Popup was blocked');
      onSuccess?.('window');
    }
  } catch (error) {
    // ✅ This error is a genuine failure of the fallback, so we report it.
    // No need for AbortError/NotAllowedError checks here (dead code).
    onError?.(error, fallback);
  }
}

// const isInertSupported = 'inert' in HTMLElement.prototype;
// Or for a slightly more specific check:
// const isInertSupported = HTMLElement.prototype.hasOwnProperty('inert');

/**
 * Copies text to the clipboard using the modern Clipboard API,
 * with a robust fallback for older browsers/insecure contexts.
 *
 * @param text - The text to copy.
 * @returns `true` if the copy succeeded, `false` otherwise.
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  // Try the modern Async Clipboard API (only available in secure contexts)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch { // (err)
      // console.warn('Clipboard API failed, falling back to execCommand:', err);
      // Fall through to the fallback
    }
  }

  // Fallback using document.execCommand (deprecated but widely supported)
  try {
    // Use a textarea to handle newlines (\n) correctly
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Make it invisible but keep it in the DOM for selection

    // ;pointer-events:none // Option: Prevents accidental mouse clicks
    textArea.style.cssText = 'opacity:0;position:fixed;left:-9999px;top:-9999px';
    
    textArea.readOnly = true; // Prevents mobile keyboard
    textArea.tabIndex = -1; // Removes from tab order

    document.body.appendChild(textArea);

    // Select the text (works on both desktop and mobile)
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return true;
    }
    throw new Error('Copy failed');
  } catch { //  (err)
    // console.error('Failed to copy text to clipboard:', err);
    return false;
  }
};
