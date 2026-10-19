export const localeRegex = new RegExp(`^\\/(${Object.keys(APP.locales).join('|')})(?=\\/|$)`);

export const getCurrentLang = (withAdmin: boolean = false) => {
  const currentPath = window.location.pathname;

  if (!currentPath.startsWith('/app')) {
    return currentPath.match(localeRegex)?.[1] || "";
  }

  if (withAdmin) return "";

  return localStorage.getItem("i18nextLng") || "";
};

export const changeUrlLang = (lang: string, currentPath: string) => {
  window.location.replace(
    currentPath.match(localeRegex)
      ? currentPath.replace(localeRegex, lang !== APP.defaultLang ? "/" + lang : "")
      : "/" + lang + currentPath
  );
};
