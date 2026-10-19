import { useEffect, useRef, useState } from "react";

export type UseIdleDetectorOptions = {
  /**
   * Enable/disable idle detection (default: true).
   */
  enabled?: boolean;

  /**
   * Idle threshold in milliseconds (default: 60000 = 1 minute).
   */
  threshold?: number;

  /**
   * Optional AbortSignal for the IdleDetector API (experimental).
   */
  signal?: AbortSignal;

  /**
   * Custom events to track user activity in fallback mode.
   * If not provided, a default robust set of events is used.
   */
  events?: (keyof WindowEventMap)[]; // Array<keyof WindowEventMap> | string[];

  // Element
  target?: HTMLElement | React.RefObject<HTMLElement> | Window;

  /**
   * Callback when idle state changes.
   */
  onChange?: (idle: boolean) => void;
};

export type UseIdleDetectorReturn = {
  /**
   * Whether the user is currently idle.
   */
  isIdle: boolean;

  /**
   * Pause idle detection (no activity events will be tracked).
   */
  pause: () => void;

  /**
   * Resume idle detection (activity events tracking restarts).
   */
  resume: () => void;
};

/**
 * Detects whether the user is idle or active using:
 * - Uses IdleDetector API (if supported) for system-wide detection (window only)
 * - Fallback to DOM activity events (mousemove, keydown, etc.)
 *
 * @param options.enabled Enable or disable the idle detector (default: true)
 * @param options.threshold Idle threshold in ms (default: 60000 = 1 minute)
 * @param options.signal AbortSignal for cleanup (optional)
 * @param options.events Custom events for fallback mode (default: common activity events)
 * @param options.target bind target element 
 * @param options.onChange Callback when idle state changes
 */
export const useIdleDetector = ({
  enabled = true,
  threshold = 6e4,
  signal,
  events,
  target,
  onChange,
}: UseIdleDetectorOptions = {}): UseIdleDetectorReturn => {
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | number | null>(null);
  const pausedRef = useRef(false);
  const lastIdleRef = useRef<boolean>(false);

  const updateIdleState = (idle: boolean) => {
    if (pausedRef.current) return;
    if (lastIdleRef.current !== idle) {
      lastIdleRef.current = idle;
      setIsIdle(idle);
      onChange?.(idle);
    }
  };

  const resetFallbackTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = setTimeout(() => updateIdleState(true), threshold);
    updateIdleState(false);
  };

  useEffect(() => {
    if (!enabled) return;

    // @ts-ignore
    let detector: IdleDetector | undefined | null;
    let cancelled: boolean | undefined;

    // Determine actual target: RefObject.current > element > window
    const eventTarget: HTMLElement | Window = target && "current" in target ? target.current ?? window : target ?? window;

    // ["mousemove", "keydown", "scroll", "touchstart", "click"]
    const activityEvents: (keyof WindowEventMap)[] = events ?? [
      // "click",
      "mousemove",        // desktop mouse movement
      "mousedown",        // mouse click / press
      "keydown",          // keyboard input
      "scroll",           // scroll via mouse, keyboard, or touch
      "touchstart",       // mobile / tablet touch
      "touchmove",        // drag/scroll gesture on touch devices
      "wheel",            // mouse wheel or trackpad scroll
    ];

    const setupFallback = () => {
      activityEvents.forEach(evt =>
        eventTarget.addEventListener(evt, resetFallbackTimer, { passive: true })
      );

      resetFallbackTimer();
    };

    const startIdleDetector = async () => {
      // Only use IdleDetector if system-wide (window) and supported
      if (eventTarget !== window || !("IdleDetector" in window)) {
        setupFallback();
        return;
      }

      try {
        // @ts-ignore Experimental API
        const perm: PermissionState = (await IdleDetector.requestPermission?.()) ?? "denied";

        if (perm !== "granted") {
          setupFallback();
          return;
        }

        // @ts-ignore Experimental API
        detector = new IdleDetector();

        // @ts-ignore Experimental API
        await detector.start({ threshold, signal });

        // @ts-ignore Experimental API
        detector.addEventListener("change", () => {
          if (cancelled) return;
          updateIdleState(detector!.userState === "idle");
        });
      } catch {
        setupFallback();
      }
    };

    startIdleDetector();

    return () => {
      cancelled = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      if (detector) {
        detector.stop?.();
        detector = null;
      }

      activityEvents.forEach(evt =>
        eventTarget.removeEventListener(evt, resetFallbackTimer)
      );
    };
  }, [enabled, threshold, signal, events, target]);

  const pause = () => {
    pausedRef.current = true;
  };

  const resume = () => {
    pausedRef.current = false;
    resetFallbackTimer();
  };

  return { isIdle, pause, resume };
}
