import { useState, useEffect } from "react";

/**
 * A hook that manages the document title.
 * - Accepts an optional initial title (string).
 * - Returns a `setTitle` function to update the title later.
 *
 * @example
 * // With initial title
 * const setTitle = useDocumentTitle("Posts | App name");
 *
 * // Without initial title (set later)
 * const setTitle = useDocumentTitle();
 * useEffect(() => setTitle("Profile"), []);
 *
 * // Update on a button click
 * <button onClick={() => setTitle("New Title")}>Change</button>
 */
export const useDocumentTitle = (initialTitle?: string, separator = " • ") => {
  const [title, setTitleState] = useState<string | undefined>(initialTitle);

  useEffect(() => {
    if (typeof title === 'string' && title.trim()) {
      document.title = separator ? title + separator + APP.name : title;
    }
  }, [title, separator]);

  return setTitleState;
};
