'use client';

import React, { useContext } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { LOCALE_NAMES } from '@/lib/i18n';
import { I18nContext } from '@/components/I18nProvider';
import './LanguageShowcase.css';

const LanguageShowcase = () => {
  // Check if we're inside I18nProvider
  const context = useContext(I18nContext);
  
  // If not inside I18nProvider, render nothing
  if (!context) {
    return null;
  }

  const { locale, changeLocale } = useI18n();

  return (
    <section className="language-showcase">
      <div className="container">
        <h3 className="showcase-title">Disponible en plusieurs langues</h3>
        <div className="language-grid">
          {Object.entries(LOCALE_NAMES).map(([code, info]) => (
            <button
              key={code}
              className={`language-card ${locale === code ? 'active' : ''}`}
              onClick={() => changeLocale(code)}
            >
              <div className="flag-large">{info.flag}</div>
              <h4>{info.nativeName}</h4>
              <p>{info.name}</p>
              {locale === code && <div className="active-badge">✓ Actif</div>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LanguageShowcase;
