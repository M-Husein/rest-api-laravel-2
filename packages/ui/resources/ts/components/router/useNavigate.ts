import { useNavigate as useNav, NavigateOptions, To } from 'react-router';
import { useTranslation } from 'react-i18next';
import { featureApi } from '@/core/feature';

export const useNavigate = () => {
  const navigate = useNav();
  const { i18n } = useTranslation();
  // const lang = i18n.language;

  return (to: To, options?: NavigateOptions) => {
    const target = featureApi.localizeHref(to, i18n.language);
    navigate(target, options);
  };
};
