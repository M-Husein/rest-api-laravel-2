import { useNavigate as useNav, NavigateOptions, To } from 'react-router';
import { useTranslation } from 'react-i18next';
import { setLangToUrl } from '@/utils/setLangToUrl';

export const useNavigate = () => {
  const navigate = useNav();
  const { i18n } = useTranslation();
  // const lang = i18n.language;

  return (to: To, options?: NavigateOptions) => {
    const target = setLangToUrl(to, i18n.language);
    navigate(target, options);
  };
};
