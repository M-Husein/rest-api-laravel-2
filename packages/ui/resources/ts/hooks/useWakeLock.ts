import { useEffect, useRef, useState } from "react";

export type WakeLockState = "active" | "released" | "unsupported";

export type UseWakeLockOptions = {
  enabled?: boolean;
  onChange?: (state: WakeLockState) => void;
};

const isWakeLockSupported = "wakeLock" in navigator;

/**
 * React hook to manage Wake Lock API (screen lock) in browsers.
 * - Keeps screen awake when enabled
 * - Releases wake lock when disabled
 * - Automatically reacquires if temporarily released
 */
export const useWakeLock = ({
  enabled = true,
  onChange,
}: UseWakeLockOptions = {}) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const lastStateRef = useRef<WakeLockState | null>(null);
  const retryRef = useRef<any>(null); // for setTimeout retry
  const [state, setState] = useState<WakeLockState>(() => isWakeLockSupported ? "released" : "unsupported");

  useEffect(() => {
    // If not supported, don’t run anything
    if(!isWakeLockSupported){
      setState("unsupported");
      return;
    }

    let cancelled = false;

    const updateState = (newState: WakeLockState) => {
      if(lastStateRef.current !== newState){
        lastStateRef.current = newState;
        setState(newState);
        onChange?.(newState);
      }
    };

    const releaseWakeLock = async () => {
      if(wakeLockRef.current){
        try {
          await wakeLockRef.current.release();
        } catch { // (err)
          // console.warn("Wake Lock release failed:", err);
        }
        wakeLockRef.current = null;
        updateState("released");
      }
    };

    if(!enabled){
      releaseWakeLock();
      return;
    }

    const requestWakeLock = async () => {
      try {
        const wakeLock = await navigator.wakeLock.request("screen");
        wakeLockRef.current = wakeLock;
        updateState("active");

        wakeLock.addEventListener("release", () => {
          if(cancelled) return;
          
          updateState("released");

          if(enabled){
            retryRef.current = setTimeout(requestWakeLock, 1e3);
          }
        });
      } catch { // (err)
        // console.warn("Wake Lock request failed:", err);
        updateState("released");
      }
    };

    requestWakeLock();

    return () => {
      cancelled = true;

      if(retryRef.current) clearTimeout(retryRef.current);

      releaseWakeLock();
    };
  }, [enabled, onChange]);

  return state;
};
