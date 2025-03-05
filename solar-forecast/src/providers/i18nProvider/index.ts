import { useTranslation } from "react-i18next";

const useI18nProvider = () => {
  const { i18n } = useTranslation();

  const i18nProvider = {
    translate: (key: string, params?: object) => i18n.t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return i18nProvider;
};

export default useI18nProvider;
