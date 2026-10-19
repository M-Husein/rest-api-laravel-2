import { useState, useEffect, useRef } from "react";

export type useNetworkParams = {
  onOnline?: () => void,
  onOffline?: () => void,
};

/**
 * @typedef {object} UseNetworkParams
 * @property {() => void} [onOnline] - Optional callback function to be executed when the network comes online.
 * @property {() => void} [onOffline] - Optional callback function to be executed when the network goes offline.
 */

/**
 * A React Hook to detect and monitor the browser's online/offline network status.
 * It provides the current network status as a boolean and allows optional callbacks
 * for when the network status changes.
 * 
 * @param {UseNetworkParams} [params={}] - An object containing optional callback functions.
 * @returns {boolean} - Returns `true` if the browser is online, `false` otherwise.
 */
export const useNetwork = ({
  onOnline,
  onOffline
}: useNetworkParams = {}): boolean => {
  const [state, setState] = useState(navigator.onLine);

  /**
   * Use refs to store the latest callback functions.
   * This prevents the useEffect from re-running when callbacks change,
   * ensuring event listeners are only added/removed once.
   */
  const onOnlineRef = useRef(onOnline);
  const onOfflineRef = useRef(onOffline);

  /**
   * Effect to update the refs whenever the onOnline/onOffline props change.
   * This ensures the event listeners always call the most up-to-date callback functions.
   */
  useEffect(() => {
    onOnlineRef.current = onOnline;
    onOfflineRef.current = onOffline;
  }, [onOnline, onOffline]); // Dependencies are necessary to update the ref's current value

  useEffect(() => {
    const handleChange = () => {
      let isOnline = navigator.onLine; // Get current online status

      setState(isOnline); // Update state

      // Call the relevant callback based on the current online status
      isOnline ? onOnlineRef.current?.() : onOfflineRef.current?.();
    }

    const controller = new AbortController();
		const signal = controller.signal;

    // Add event listeners when the component mounts
    window.addEventListener("offline", handleChange, { signal });
    window.addEventListener("online", handleChange, { signal });

    // Cleanup function: remove event listeners when the component unmounts
    return () => {
      controller.abort();
      // window.removeEventListener("offline", handleChange);
      // window.removeEventListener("online", handleChange);
    }
  }, []);

  return state;
}
