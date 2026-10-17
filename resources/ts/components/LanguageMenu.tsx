import type { MenuProps } from "antd";
import { Dropdown, Avatar, Button } from 'antd';
import { useSetLocale } from "@refinedev/core"; // useTranslate, useGetLocale, useUpdate
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
  // user,
  overlayStyle,
}: any) => {
  "use memo";
  const { t, i18n } = useTranslation();
  // const locale = useGetLocale();
  // const currentLocale = locale();
  const changeLanguage = useSetLocale();
  // const t = useTranslate();
  const currentLocale = i18n.language;
  // const { mutate, mutation: { isPending } } = useUpdate();

  // console.log('i18n:', i18n);
  // console.log('currentLocale:', currentLocale);

  const changeLocale = async (lang: string) => {
    // Only hit by user logged.
    // if(user?.authenticated){
    //   mutate({
    //     resource: "users", // users/language
    //     id: "language",
    //     values: { lang },
    //     meta: {
    //       keepalive: true,
    //     },
    //     successNotification: false,
    //   }); 
    // }

    await changeLanguage(lang);
  };

  // (i18n.languages || [])
  const languageOptions: MenuProps["items"] = Object.keys(APP.locales)
    // .toSorted()
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
        // disabled={isPending}
        icon={renderFlag(currentLocale, 22)}
      />
    </Dropdown>
  );
}
