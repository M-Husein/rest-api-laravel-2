import type { MenuProps } from "antd";
import { Dropdown, Avatar, Button } from 'antd';
import { useSetLocale } from "@refinedev/core";
import { useTranslation } from "react-i18next";

const renderFlag = (lang: string | undefined, size: number) => (
  <Avatar
    size={size}
    shape="square"
    alt={lang}
    src={`/media/img/flags/lang-${lang}.svg`}
  />
);

export const LanguageMenu = ({
  overlayStyle,
}: any) => {
  "use memo";
  const { t, i18n } = useTranslation();
  const changeLanguage = useSetLocale();
  const currentLocale = i18n.language;

  const changeLocale = async (lang: string) => {
    await changeLanguage(lang);
  };

  const languageOptions: MenuProps["items"] = Object.keys(APP.locales)
    .map((lang: string) => ({
      key: lang,
      icon: renderFlag(lang, 16),
      label: APP.locales[lang],
      onClick: () => changeLocale(lang),
    }));

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items: languageOptions,
        selectedKeys: currentLocale ? [currentLocale] : [],
      }}
      getPopupContainer={(triggerNode: any) => triggerNode.parentElement}
      styles={{ root: overlayStyle }}
    >
      <Button
        className="flex items-center"
        title={t("language")}
        icon={renderFlag(currentLocale, 22)}
      />
    </Dropdown>
  );
}
