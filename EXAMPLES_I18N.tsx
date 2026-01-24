// Exemple d'utilisation du système i18n

// 1. Hook personnalisé pour toutes les traductions
import { useI18n } from '@/hooks/useI18n';

export function MonComposant() {
  const { t, locale, changeLocale, localeNames } = useI18n();

  return (
    <div>
      {/* Afficher du texte traduit */}
      <h1>{t('landing.welcomeTitle')}</h1>

      {/* Afficher la locale actuelle */}
      <p>Langue actuelle: {localeNames[locale].nativeName}</p>

      {/* Changer de langue */}
      <button onClick={() => changeLocale('en')}>
        English
      </button>

      {/* Lister les langues */}
      <div>
        {Object.entries(localeNames).map(([code, info]) => (
          <button key={code} onClick={() => changeLocale(code)}>
            {info.flag} {info.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
}

// 2. Ajouter une traduction dans fr.json
/*
{
  "myFeature": {
    "title": "Ma Fonctionnalité",
    "description": "Description de ma fonctionnalité"
  }
}
*/

// 3. Utiliser la traduction
const { t } = useI18n();
console.log(t('myFeature.title')); // "Ma Fonctionnalité"

// 4. Gestion des erreurs
// Si une clé n'existe pas, la clé elle-même est retournée
console.log(t('nonexistent.key')); // "nonexistent.key"

// 5. Traduction imbriquée profonde
// t('deep.nested.structure.key') fonctionne correctement

// 6. La persistance fonctionne automatiquement
// - localStorage stocke la locale
// - document.documentElement.lang est mis à jour
// - La langue est conservée au rafraîchissement
