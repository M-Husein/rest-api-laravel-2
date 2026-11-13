import type { Locale } from "antd/es/locale";
import { applyDayjsLocale } from "./dayjsAdapter";
import { buildAntdLocale } from "./antdAdapter";
import { getLocaleDirection } from "./localeMeta";

/**
 * Resolves the UI locale for a language without importing any
 * `antd/es/locale/*` or `dayjs/locale/*` module. Both toolkits are fed
 * from our own translation keys (with English fallbacks), the same way
 * validation.ts maps zod codes to i18n keys.
 */
export const loadLocale = async (
  language: string,
): Promise<Locale> => {
  const lang = language.split("-")[0];

  applyDayjsLocale(lang);
  document.documentElement.dir = getLocaleDirection(lang);

  return buildAntdLocale(lang);
};
