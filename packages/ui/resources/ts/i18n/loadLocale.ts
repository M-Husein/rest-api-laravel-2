import dayjs from "dayjs";
import type { Locale } from "antd/es/locale";

export const loadLocale = async (
  language: string,
): Promise<Locale> => {
  const lang = language.split("-")[0];

  switch (lang) {
    case "id": {
      const [antdLocale] = await Promise.all([
        import("antd/es/locale/id_ID"),
        import("dayjs/locale/id"),
      ]);

      dayjs.locale("id");

      return antdLocale.default;
    }

    case "en":
    default: {
      const [antdLocale] = await Promise.all([
        import("antd/es/locale/en_US"),
        import("dayjs/locale/en"),
      ]);

      dayjs.locale("en");

      return antdLocale.default;
    }
  }
};
