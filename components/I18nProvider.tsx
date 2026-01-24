"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Locale, MESSAGES, SUPPORTED_LOCALES, isSupportedLocale } from '@/lib/i18n';

type TFunc = (key: string, params?: Record<string, string | number>) => string;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TFunc;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    try {
      // 1. Première priorité : locale sauvegardée dans localStorage
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('yowyob_locale') : null;
      if (saved && isSupportedLocale(saved)) {
        setLocaleState(saved);
        document.documentElement.lang = saved;
        return;
      }

      // 2. Deuxième priorité : langue du navigateur
      const nav = typeof navigator !== 'undefined' ? navigator.language : 'fr';
      const short = nav.split('-')[0];
      if (isSupportedLocale(short)) {
        setLocaleState(short as Locale);
        document.documentElement.lang = short;
        // Sauvegarder automatiquement la langue détectée
        window.localStorage.setItem('yowyob_locale', short);
        return;
      }

      // 3. Fallback sur français
      document.documentElement.lang = 'fr';
    } catch (e) {
      console.warn('Error initializing locale:', e);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem('yowyob_locale', l);
      document.documentElement.lang = l;
    } catch (e) {
      console.warn('Error saving locale:', e);
    }
  };

  const t: TFunc = (key, params) => {
    const parts = key.split('.');
    let cur: any = MESSAGES[locale];
    for (const p of parts) {
      if (!cur) return key;
      cur = cur[p];
    }

    let text = typeof cur === 'string' ? cur : key;

    if (params && text) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }

    return text;
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);



  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Return a default value instead of throwing
    const defaultT: TFunc = (key) => key;
    return {
      t: defaultT,
      locale: 'fr' as Locale,
      setLocale: () => { },
      supported: SUPPORTED_LOCALES
    };
  }
  return { t: ctx.t, locale: ctx.locale, setLocale: ctx.setLocale, supported: SUPPORTED_LOCALES };
}
