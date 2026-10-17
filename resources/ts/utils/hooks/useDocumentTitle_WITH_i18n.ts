import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

type Title = string | { i18nKey: string };

/**
 * A hook that manages the document title.
 * - Accepts an optional initial title (string or i18n object).
 * - Returns a `setTitle` function to update the title later.
 * - Automatically re‑translates the title when the language changes.
 *
 * @example
 * // Static title
 * const setTitle = useDocumentTitle("Posts | Refine");
 *
 * // Internationalized title
 * const setTitle = useDocumentTitle({ i18nKey: "page.contact.title" });
 *
 * // Update later
 * <button onClick={() => setTitle("New Title")}>Change</button>
 */
export const useDocumentTitle = (initialTitle?: Title) => {
  const { t, i18n } = useTranslation();
  const [title, setTitleState] = useState<Title | undefined>(initialTitle);

  // Resolves the title to a plain string
  const resolveTitle = useCallback(
    (titleValue?: Title) => {
      if (!titleValue) return "";
      if (typeof titleValue === "string") return titleValue;
      return t(titleValue.i18nKey);
    },
    [t]
  );

  // Update document.title whenever the title or the language changes
  useEffect(() => {
    if (title != null) {
      document.title = resolveTitle(title);
    }
  }, [title, resolveTitle, i18n.language]);

  // The setter function – call it to update the title
  const setTitle = useCallback((newTitle: Title) => {
    setTitleState(newTitle);
  }, []);

  return setTitle;
};
