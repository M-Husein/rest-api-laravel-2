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

    // case "ja": {
    //   const [antdLocale] = await Promise.all([
    //     import("antd/es/locale/ja_JP"),
    //     import("dayjs/locale/ja"),
    //   ]);

    //   dayjs.locale("ja");

    //   return antdLocale.default;
    // }

    // case "zh": {
    //   const [antdLocale] = await Promise.all([
    //     import("antd/es/locale/zh_CN"),
    //     import("dayjs/locale/zh-cn"),
    //   ]);

    //   dayjs.locale("zh-cn");

    //   return antdLocale.default;
    // }

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
