import en from '../locales/en.json';
import fr from '../locales/fr.json';

export type Locale = 'fr' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['fr', 'en'];

export const LOCALE_NAMES: Record<Locale, { name: string; flag: string; nativeName: string }> = {
  fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  en: { name: 'English', flag: '🇬🇧', nativeName: 'English' },
};

export const MESSAGES: Record<Locale, Record<string, any>> = {
  en,
  fr,
};

export function isSupportedLocale(l: string): l is Locale {
  return (['fr', 'en'] as string[]).includes(l);
}

export function getLocaleInfo(locale: Locale) {
  return LOCALE_NAMES[locale];
}
