// components/Header.tsx
'use client';

import React, { useContext, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from './I18nProvider';
import { I18nContext } from './I18nProvider';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Check if we're inside I18nProvider
  const context = useContext(I18nContext);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // If not inside I18nProvider, render a minimal header
  if (!context) {
    return (
      <header className="navbar">
        <div className="container">
         <div className="logo">
  <Image 
    src="/images/logo.jpg" 
    alt="Yowyob Feedback Logo" 
    width={150}      // Largeur d'origine (ou souhaitée)
    height={50}      // Hauteur d'origine
    priority         // Ajoute ceci : c'est un logo, il doit charger vite
    style={{ height: '50px', width: 'auto' }} 
  />
</div>
          <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          <div className={`nav-wrapper ${isMenuOpen ? 'open' : ''}`}>
            <nav>
              <ul>
                <li><a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a></li>
                <li><a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How it works</a></li>
                <li><a href="#testimonials" onClick={() => setIsMenuOpen(false)}>Testimonials</a></li>
                <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
              </ul>
            </nav>
            <div className="header-right">
              <div className="auth-buttons" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Link href="/auth/login" className="btn btn-secondary" style={{ marginRight: '10px' }}>
                  Login
                </Link>
                <Link href="/auth/signup" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
    );
  }

  const { t } = useTranslation();

  return (
    <header className="navbar">
      <div className="container">
        <div className="logo">
  <Image 
    src="/images/logo.jpg" 
    alt="Yowyob Feedback Logo" 
    width={150}      // Largeur d'origine (ou souhaitée)
    height={50}      // Hauteur d'origine
    priority         // Ajoute ceci : c'est un logo, il doit charger vite
    style={{ height: '50px', width: 'auto' }} 
  />
</div>

        <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        <div className={`nav-wrapper ${isMenuOpen ? 'open' : ''}`}>
          <nav>
            <ul>
              <li><a href="#features" onClick={() => setIsMenuOpen(false)}>{t('header.features')}</a></li>
              <li><a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>{t('header.howItWorks')}</a></li>
              <li><a href="#testimonials" onClick={() => setIsMenuOpen(false)}>{t('header.testimonials')}</a></li>
              <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>{t('header.contact')}</a></li>
            </ul>
          </nav>
          <div className="header-right">
            <div className="auth-buttons" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Link href="/auth/login" className="btn btn-secondary" style={{ marginRight: '10px' }}>
                {t('header.login')}
              </Link>
              <Link href="/auth/signup" className="btn btn-primary">
                {t('header.register')}
              </Link>
            </div>
            {/* Language selector - nouveau composant élégant */}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}