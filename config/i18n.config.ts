// Configuration centralisée du système i18n
// Ce fichier peut être utilisé dans les outils de build ou scripts

export const I18N_CONFIG = {
  // Langues supportées
  supportedLanguages: ['fr', 'en', 'es', 'de'] as const,
  
  // Langue par défaut
  defaultLanguage: 'fr' as const,
  
  // Configuration de chaque langue
  languages: {
    fr: {
      name: 'Français',
      nativeName: 'Français',
      flag: '🇫🇷',
      dir: 'ltr', // left-to-right
      htmlLang: 'fr-FR',
    },
    en: {
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      dir: 'ltr',
      htmlLang: 'en-US',
    },
    es: {
      name: 'Español',
      nativeName: 'Español',
      flag: '🇪🇸',
      dir: 'ltr',
      htmlLang: 'es-ES',
    },
    de: {
      name: 'Deutsch',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      dir: 'ltr',
      htmlLang: 'de-DE',
    },
  },

  // Clés de stockage
  storageKey: 'yowyob_locale',

  // Configuration de détection
  detection: {
    // Activer la détection de la langue du navigateur
    enableBrowserLanguageDetection: true,
    // Fallback si la langue n'est pas supportée
    fallbackLanguage: 'fr' as const,
  },

  // Namespaces (pour l'organisation)
  namespaces: ['header', 'sidebar', 'footer', 'landing', 'features', 'how', 'testimonials', 'auth', 'feed', 'profileEdit'] as const,
};

// Utilitaires
export function isLanguageSupported(lang: string): boolean {
  return I18N_CONFIG.supportedLanguages.includes(lang as any);
}

export function getLanguageConfig(lang: string) {
  return I18N_CONFIG.languages[lang as keyof typeof I18N_CONFIG.languages];
}

export function getAllLanguages() {
  return I18N_CONFIG.supportedLanguages.map(lang => ({
    code: lang,
    ...I18N_CONFIG.languages[lang],
  }));
}
