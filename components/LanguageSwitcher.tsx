'use client';

import React, { useState, useContext } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { LOCALE_NAMES } from '@/lib/i18n';
import { I18nContext } from '@/components/I18nProvider';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  // Check if we're inside I18nProvider
  const context = useContext(I18nContext);
  const [isOpen, setIsOpen] = useState(false);

  // If not inside I18nProvider, render nothing
  if (!context) {
    return null;
  }

  const { locale, changeLocale } = useI18n();
  const currentLanguage = LOCALE_NAMES[locale as keyof typeof LOCALE_NAMES];

  return (
    <div className="language-switcher-container">
      <button
        className="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Change language"
      >
        <span className="language-flag">{currentLanguage.flag}</span>
        <span className="language-name">{currentLanguage.nativeName}</span>
        <span className="dropdown-icon">▼</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {Object.entries(LOCALE_NAMES).map(([code, info]) => (
            <button
              key={code}
              className={`language-option ${locale === code ? 'active' : ''}`}
              onClick={() => {
                changeLocale(code);
                setIsOpen(false);
              }}
            >
              <span className="option-flag">{info.flag}</span>
              <span className="option-name">{info.nativeName}</span>
              {locale === code && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
