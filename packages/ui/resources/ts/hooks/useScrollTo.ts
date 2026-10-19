import { useState, useEffect, useMemo } from 'react'; // useCallback
import { throttle } from 'q-js-utils/throttle';

/**
 * Interface for the return value of the useScrollTo hook.
 */
interface UseScrollToResult {
  /** Function to smoothly scroll the window to the top (y=0). */
  scrollToTop: () => void;
  /** Function to smoothly scroll the window to the bottom. */
  scrollToBottom: () => void;
  /** True if the user is at or near the very top of the page. */
  // isAtTop: boolean;
  /** True if the scroll position exceeds the defined threshold, usually to show the 'scroll-up' button. */
  isButtonVisible: boolean;
  /** The current vertical scroll position in pixels (window.scrollY). */
  // scrollPosition: number;
}

/**
 * Custom React hook (TypeScript) to manage scrolling behavior (top/bottom)
 * and detect scroll position for button visibility.
 *
 * @param threshold The scroll position in pixels to trigger isButtonVisible (default is 200).
 * @returns An object containing scroll functions and state variables.
 */
export const useScrollTo = (threshold: number = 200): UseScrollToResult => {
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  // Determine if the scroll position is at the very top
  // const isAtTop: boolean = scrollPosition <= 0;

  // Determine if the scroll button (for scrolling up) should be visible
  // const isButtonVisible: boolean = scrollPosition > threshold;

  const isButtonVisible = useMemo(() => scrollPosition > threshold, [scrollPosition]); // , threshold

  // const scrollToTop = useCallback((): void => {
  //   window.scrollTo({
  //     top: 0,
  //     behavior: 'smooth',
  //   });
  // }, []);

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // const scrollToBottom = useCallback((): void => {
  //   window.scrollTo({
  //     top: document.documentElement.scrollHeight,
  //     behavior: 'smooth',
  //   });
  // }, []);

  const scrollToBottom = (): void => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  // Effect to attach and cleanup the scroll event listener
  useEffect(() => {
    const handleScroll = throttle(() => {
      // We use window.scrollY || document.documentElement.scrollTop for better cross-browser compatibility
      const position: number = window.scrollY;
      setScrollPosition(
        position
      );
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return {
    scrollToTop,
    scrollToBottom,
    // isAtTop,
    isButtonVisible,
    // scrollPosition,
  };
}
