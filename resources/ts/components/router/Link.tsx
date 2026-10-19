import { Link as RouterLink, LinkProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import { featureApi } from '@/core/feature';

export const Link = ({ to, ...props }: LinkProps) => {
  const { i18n } = useTranslation();
  // const lang = i18n.language;
  const target = featureApi.localizeHref(to, i18n.language);

  return <RouterLink to={target} {...props} />;
};

export const A = ({ href, ...props }: any) => {
  const { i18n } = useTranslation();
  const target = featureApi.localizeHref(href, i18n.language);

  return <a href={target} {...props} />;
};
