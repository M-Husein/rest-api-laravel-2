import { useCallback, useEffect, useRef, useState } from "react";
import { copyStyles as copyStylesFn } from "q-js-utils/copyStyles";

export interface NewWindowFeatures {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  [key: string]: any;
}

export interface UseNewWindowProps {
  url?: string;

  /**
   * or target, _blank, _parent, _self, _top, 
   * or A custom string: Assigns a name to the window, 
   * which can be used to target it later.
   */
  name?: string;

  /**
   * Window document <title>
   */
  title?: string;
  features?: NewWindowFeatures;
  center?: "parent" | "screen";

  /**
   * Close when parent tab unloads
   */
  closeOnParentUnload?: boolean;

  /**
   * Close when React unmounts
   */
  closeOnUnmount?: boolean;
  
  /**
   * Controlled
   */
  open?: boolean;
  copyStyles?: boolean;
  onOpen?: (win: Window) => void;
  onClose?: () => void;
}

export const useNewWindow = ({
  url = "", // about:blank
  name = "",
  title = "",
  features = { width: 550, height: 590 },
  center = "screen", // parent
  closeOnParentUnload = true,
  closeOnUnmount = true,
  open,
  copyStyles,
  onOpen,
  onClose,
}: UseNewWindowProps) => {
  const windowRef = useRef<Window | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openWindow = useCallback(() => {
    if (!windowRef.current || windowRef.current.closed) {
      // Centering
      /**
        typeof center === "string" &&
        (features.width != null || features.height != null)
       */
      if(
        ["screen", "parent"].includes(center) && 
        (features.width != null || features.height != null)
      ){
        if (center === "screen") {
          features.left = (screen.width - features.width!) / 2;
          features.top = (screen.height - features.height!) / 2;
        }
        else {
          features.left = window.top!.outerWidth / 2 + window.top!.screenX - features.width! / 2;
          features.top = window.top!.outerHeight / 2 + window.top!.screenY - features.height! / 2;
        }
      }
      
      const win = window.open(url, name, toFeatures(features));
      if (win) {
        let winDoc: Document = win.document;
        // Ensure <head> exists
        let head = winDoc.head || winDoc.querySelector("head");
        if (!head) {
          head = winDoc.createElement("head");
          winDoc.documentElement.insertBefore(head, winDoc.body);
        }

        // // Copy meta charset + viewport
        // // if (copyMetas) {
        //   let metas = document.querySelectorAll<HTMLMetaElement>(
        //     'meta[charset], meta[name="viewport"]'
        //   );
        //   metas.forEach((meta) => {
        //     let clone = winDoc.createElement("meta");
        //     for (let i = 0; i < meta.attributes.length; i++) {
        //       let attr = meta.attributes[i];
        //       !!attr && clone.setAttribute(attr.name, attr.value);
        //     }
        //     winDoc.head.appendChild(clone);
        //   });
        // // }

        // Copy favicon from parent
        let parentFavicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
        if (parentFavicon) {
          let link = winDoc.createElement("link");
          link.rel = parentFavicon.rel;
          link.href = parentFavicon.href;
          // link.type = parentFavicon.type || "image/icon"; // "image/x-icon" | "image/svg+xml"
          head.appendChild(link);
        }

        winDoc.title = title;

        windowRef.current = win;

        setIsOpen(true);

        // Copy styles
        if (copyStyles) {
          setTimeout(() => copyStylesFn(document, windowRef.current!.document), 0);
        }

        onOpen?.(win);
      }
    }
  }, [url, name, features, onOpen]);

  const closeWindow = useCallback(() => {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close();
    }
    if (windowRef.current) {
      windowRef.current = null;
      setIsOpen(false);
      onClose?.();
    }
  }, [onClose]);

  // Controlled mode (sync with `open` prop)
  useEffect(() => {
    if (open === true) {
      openWindow();
    } else if (open === false) {
      closeWindow();
    }
  }, [open, openWindow, closeWindow]);

  // Detect when popup is closed manually
  useEffect(() => {
    if (!isOpen || !windowRef.current) return;

    const timer = setInterval(() => {
      if (windowRef.current && windowRef.current.closed) {
        clearInterval(timer);
        closeWindow();
      }
    }, 500);

    return () => clearInterval(timer);
  }, [isOpen, closeWindow]);

  // Close on parent unload (refresh, close tab)
  useEffect(() => {
    if (!closeOnParentUnload) return;

    const handler = () => closeWindow();

    window.addEventListener("beforeunload", handler);
    
    return () => window.removeEventListener("beforeunload", handler);
  }, [closeOnParentUnload, closeWindow]);

  // Close on React unmount
  useEffect(() => {
    return () => {
      if (closeOnUnmount) {
        closeWindow();
      }
    };
  }, [closeOnUnmount, closeWindow]);

  return { 
    open: openWindow, 
    close: closeWindow, 
    isOpen, 
    windowRef 
  };
}

/**
 * Convert feature object into "key=value,key=value" string
 */
const toFeatures = (obj: Record<string, any>): string => 
  Object.entries(obj)
    .map(([k, v]) => `${k}=${typeof v === "boolean" ? (v ? "yes" : "no") : v}`)
    .join(",");
