import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Locale } from "antd/es/locale";
import { AppLocaleProvider } from "@/core/locale";
import { loadLocale } from "./loadLocale";

export const LocaleProvider = ({
  children,
}: React.PropsWithChildren) => {
  const { i18n } = useTranslation();
  const [antdLocale, setAntdLocale] = useState<Locale>();

  useEffect(() => {
    loadLocale(i18n.language).then(setAntdLocale);
  }, [i18n.language]);

  return (
    <AppLocaleProvider value={{ antdLocale, ready: !!antdLocale }}>
      {children}
    </AppLocaleProvider>
  );
};
