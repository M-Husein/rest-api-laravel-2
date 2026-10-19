import { useEffect } from 'react';

/**
 * Hook to warn users before they close or reload the browser tab.
 *
 * @param {boolean} enabled - Whether the unload warning should be active.
 * @param {string} [message=""] - The message shown in the browser's confirmation dialog.
 *
 * @example
 * useBeforeUnload(true); // Enables the warning
 * useBeforeUnload(false); // Disables the warning
 */
export const useBeforeUnload = (
  enabled: boolean, 
  message: string = "" // Are you sure you want to leave?
): void => {
  useEffect(() => {
    if(!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent): string => {
      e.preventDefault();
      e.returnValue = !!message; // Included for legacy support, e.g. Chrome/Edge < 119
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, message]);
}
