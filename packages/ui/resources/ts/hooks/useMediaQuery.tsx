import { useEffect, useState, useRef } from "react";

/**
 * React hook for subscribing to one or more CSS media queries.
 *
 * @param queries - An array of media query strings.
 * @param onChange - Optional callback invoked whenever the match states change
 *                   (only when the results actually differ from the last state).
 * @returns An array of booleans, same length/order as `queries`, representing which queries currently match.
 *
 * @example
 * const [isMobile, isTablet, isDesktop] = useMediaQuery(
 *   [
 *     "(max-width: 640px)",
 *     "(min-width: 641px) and (max-width: 1024px)",
 *     "(min-width: 1025px)"
 *   ],
 *   (matches) => console.log("Changed:", matches)
 * );
 */
export const useMediaQuery = (
  queries: string[],
  onChange?: (matches: boolean[]) => void
): boolean[] => {
  // const getMatches = (): boolean[] => 
  //   // For SSR
  //   typeof window !== "undefined"
  //     ? queries.map(q => window.matchMedia(q).matches)
  //     : queries.map(() => false);

  const [matches, setMatches] = useState<boolean[]>(
    queries.map(q => window.matchMedia(q).matches)
  ); // For SSR: getMatches

  // Stable ref for onChange
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(
    () => {
      // For SSR
      // if(typeof window === "undefined") return;

      const mqls = queries.map(q => window.matchMedia(q));

      const handler = () => {
        const newMatches = mqls.map(mql => mql.matches);

        setMatches((prev) => {
          if(prev.some((v, i) => v !== newMatches[i])){
            onChangeRef.current?.(newMatches);
            return newMatches;
          }
          return prev;
        });
      };

      // Sync on mount (optional, makes onChange fire immediately)
      // handler();

      // Attach listeners
      mqls.forEach(mql => mql.addEventListener("change", handler));

      return () => mqls.forEach(mql => mql.removeEventListener("change", handler));
    }, 
    /**
     * @DEV
     * Options:
     * queries.join("_")
     * or
     * JSON.stringify(queries)
     * or
     * Just use [] → run once on mount
     */
    []
  );

  return matches;
}
