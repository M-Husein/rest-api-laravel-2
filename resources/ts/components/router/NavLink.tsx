import { NavLink as RouterLink, LinkProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import { setLangToUrl } from '@/utils/setLangToUrl';

export const NavLink = ({ to, ...props }: LinkProps) => {
  const { i18n } = useTranslation();
  // const lang = i18n.language;
  const target = setLangToUrl(to, i18n.language);

  return <RouterLink to={target} {...props} />;
};
