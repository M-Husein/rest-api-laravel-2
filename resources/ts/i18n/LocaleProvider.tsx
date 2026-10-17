import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import type { Locale } from "antd/es/locale";
import { loadLocale } from "./loadLocale";

interface LocaleContextValue {
  antdLocale?: Locale;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export const LocaleProvider = ({
  children,
}: React.PropsWithChildren) => {
  const { i18n } = useTranslation();
  const [antdLocale, setAntdLocale] = useState<Locale>();

  useEffect(() => {
    loadLocale(i18n.language).then(setAntdLocale);
  }, [i18n.language]);

  return (
    <LocaleContext.Provider
      value={{ antdLocale }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocaleContext = (): LocaleContextValue => {
  const context = useContext(LocaleContext);

  /**
	 * --- Vite Environment Check for Dead Code Elimination (DCE) ---
	 * import.meta.env.DEV is:
	 * - `true` in development (the code runs)
	 * - `false` during a production build (the code is removed)
	 */
  if (import.meta.env.DEV && !context) {
    throw new Error("useLocaleContext must be used inside LocaleProvider");
  }

  return context as LocaleContextValue;
};
