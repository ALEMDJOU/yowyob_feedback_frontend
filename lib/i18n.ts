import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import de from '../locales/de.json';
import zh from '../locales/zh.json';
import ko from '../locales/ko.json';

export type Locale = 'fr' | 'en' | 'es' | 'de' | 'zh' | 'ko';

export const SUPPORTED_LOCALES: Locale[] = ['fr', 'en', 'es', 'de', 'zh', 'ko'];

export const LOCALE_NAMES: Record<Locale, { name: string; flag: string; nativeName: string }> = {
  fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  en: { name: 'English', flag: '🇬🇧', nativeName: 'English' },
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  de: { name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  zh: { name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  ko: { name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
};

export const MESSAGES: Record<Locale, Record<string, any>> = {
  en,
  fr,
  es,
  de,
  zh,
  ko,
};

export function isSupportedLocale(l: string): l is Locale {
  return (['fr', 'en', 'es', 'de', 'zh', 'ko'] as string[]).includes(l);
}

export function getLocaleInfo(locale: Locale) {
  return LOCALE_NAMES[locale];
}
