import enTranslations from '@/locales/en.json';
import frTranslations from '@/locales/fr.json';

export type Locale = 'en' | 'fr';

const translations = {
  en: enTranslations,
  fr: frTranslations,
};

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.en;
}

export function createTranslator(locale: Locale) {
  const t = translations[locale] || translations.en;

  return function translate(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = t;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters in the format {paramName}
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramName) => {
        return String(params[paramName] ?? match);
      });
    }

    return value;
  };
}

export const SUPPORTED_LOCALES: Locale[] = ['en', 'fr'];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};
