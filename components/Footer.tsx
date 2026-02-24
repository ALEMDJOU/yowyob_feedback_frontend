// components/Footer.tsx
"use client";
import React from 'react';
import Image from 'next/image';
import { useTranslation } from './I18nProvider';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer id="contact" className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-col">
                        <Image src="/images/logo.jpg" alt="Yowyob Feedback Logo" className="footer-logo" style={{ height: '40px', width: 'auto' }} width={40} height={40} />
                        <p>{t('footer.tagline')}</p>
                    </div>
                    <div className="footer-col">
                        <h3>{t('footer.quickLinks')}</h3>
                        <ul>
                            <li><a href="#features">{t('header.features')}</a></li>
                            <li><a href="#how-it-works">{t('header.howItWorks')}</a></li>
                            <li><a href="#testimonials">{t('header.testimonials')}</a></li>
                            <li><a href="#">Conditions Générales</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3>{t('footer.contactTitle')}</h3>
                        <p>{t('footer.email')}</p>
                        <p>{t('footer.phone')}</p>
                        <div className="social-icons">
                            <a href="#" aria-label="Facebook" title="Facebook">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" aria-label="X (anciennement Twitter)" title="X">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#" aria-label="LinkedIn" title="LinkedIn">
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>{t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    );
}