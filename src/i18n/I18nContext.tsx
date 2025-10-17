import { createContext, useContext, ParentComponent, JSX } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { SupportedLocale, TranslationDict } from './types';
import { translations } from './locales';

interface I18nContextValue {
  locale: () => SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, any>, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue>();

export interface I18nProviderProps {
  locale?: SupportedLocale;
  translations?: Record<string, TranslationDict>;
  children: JSX.Element;
}

// Simple translation function
function translate(dict: TranslationDict, key: string, fallback?: string): string {
  const keys = key.split('.');
  let value: any = dict;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback || key;
    }
  }

  return typeof value === 'string' ? value : fallback || key;
}

export const I18nProvider: ParentComponent<I18nProviderProps> = (props) => {
  const [state, setState] = createStore({
    locale: props.locale || 'en' as SupportedLocale,
  });

  const t = (key: string, params?: Record<string, any>, fallback?: string): string => {
    const localeTranslations = props.translations || translations;
    const dict = localeTranslations[state.locale] || localeTranslations['en'];
    let result = translate(dict, key, fallback);

    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      });
    }

    return result;
  };

  const setLocale = (locale: SupportedLocale) => {
    setState('locale', locale);
  };

  const value: I18nContextValue = {
    locale: () => state.locale,
    setLocale,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {props.children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
