'use client';

import { useTranslation } from '@/components/I18nProvider';
import { SUPPORTED_LOCALES, LOCALE_NAMES } from '@/lib/i18n';

export function useI18n() {
  try {
    const { t, locale, setLocale, supported } = useTranslation();

    return {
      t,
      locale,
      setLocale,
      supported,
      localeNames: LOCALE_NAMES,
      changeLocale: (newLocale: string) => {
        if (SUPPORTED_LOCALES.includes(newLocale as any)) {
          setLocale(newLocale as any);
        }
      },
    };
  } catch (e) {
    // Fallback if not in I18nProvider context
    return {
      t: (key: string) => key,
      locale: 'fr' as const,
      setLocale: () => {},
      supported: SUPPORTED_LOCALES,
      localeNames: LOCALE_NAMES,
      changeLocale: () => {},
    };
  }
}
