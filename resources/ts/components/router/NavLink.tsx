import { NavLink as RouterLink, LinkProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import { featureApi } from '@/core/feature';

export const NavLink = ({ to, ...props }: LinkProps) => {
  const { i18n } = useTranslation();
  // const lang = i18n.language;
  const target = featureApi.localizeHref(to, i18n.language);

  return <RouterLink to={target} {...props} />;
};
