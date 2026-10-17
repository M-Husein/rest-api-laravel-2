import { NavLink as RouterLink, LinkProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import { zoneStrategy } from '@/i18n/factory';

export const NavLink = ({ to, ...props }: LinkProps) => {
  const { i18n } = useTranslation();
  // const lang = i18n.language;
  const target = zoneStrategy().localizeHref(to, i18n.language);

  return <RouterLink to={target} {...props} />;
};
