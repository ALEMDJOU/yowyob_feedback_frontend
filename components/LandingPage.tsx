// components/LandingPage.tsx
'use client';

import React, { useEffect, useContext, useState, useRef, useCallback } from 'react';
import { useTranslation, I18nContext } from './I18nProvider';
import Image from 'next/image';
import Link from 'next/link';
import LandingFeed from './landingFeed';

const DEMO_VIDEO_URL = 'https://rwjlcxbvpoozggzkjfmi.supabase.co/storage/v1/object/public/videos/yowvideo.mp4';

// Configuration pour l'animation au défilement
const CONFIG = {
    scrollThreshold: 0.15,
    animationDelay: 150
};

// Hook personnalisé pour gérer l'animation des sections (Intersection Observer)
const useScrollAnimation = () => {
    useEffect(() => {
        // --- Animations au Défilement (Intersection Observer) ---
        const elements = document.querySelectorAll('.animate-on-scroll');

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || '0';
                    setTimeout(() => {
                        // Ajoute la classe 'visible' qui déclenche l'animation CSS (.visible est dans globals.css)
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target); // Arrête d'observer après l'apparition
                    }, parseInt(delay) + CONFIG.animationDelay);
                }
            });
        }, {
            rootMargin: '0px',
            threshold: CONFIG.scrollThreshold
        });

        elements.forEach(el => observer.observe(el));

        // Nettoyage
        return () => {
            observer.disconnect();
        };
    }, []);
};


// Composant principal (nettoyé)
const LandingPage = () => {
    useScrollAnimation();
    const [showDemoModal, setShowDemoModal] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const closeDemoModal = useCallback(() => {
        setShowDemoModal(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, []);

    // Fermer le modal avec la touche Échap
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDemoModal();
        };
        if (showDemoModal) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [showDemoModal, closeDemoModal]);

    // Check if we're inside I18nProvider
    const context = useContext(I18nContext);

    // If not inside I18nProvider, render nothing or a minimal version
    if (!context) {
        return (
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content fade-in-up" style={{ textAlign: 'center', width: '100%' }}>
                        <h1 className="text-reveal" style={{ opacity: 1, visibility: 'visible' }}>Welcome to Yowyob Feedback</h1>
                        <h3 className="fade-in-up delay-1">The ultimate platform for feedback</h3>
                        <p className="small-text fade-in-up delay-2">Join thousands of students and professionals today.</p>
                    </div>
                </div>
                <div className="particles" id="particles"></div>
            </section>
        );
    }

    const { t } = useTranslation();

    return (
        <>
            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content fade-in-up" style={{ textAlign: 'center', width: '100%' }}>
                        {/* Correction grammaticale : "Bienvenue" au lieu de "Bienvenu" */}
                        <h1 className="text-reveal" style={{ opacity: 1, visibility: 'visible' }}>{t('landing.welcomeTitle')}</h1>

                        <h3 className="fade-in-up delay-1">{t('landing.subtitle')}</h3>

                        <p className="small-text fade-in-up delay-2">{t('landing.cta')}</p>

                        {/* Bouton Voir la démo */}
                        <div className="hero-buttons fade-in-up delay-2" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                            <Link href="/auth/register" className="btn btn-primary btn-large" style={{ borderRadius: '50px', letterSpacing: '0.5px' }}>
                                {t('landing.joinButton')}
                            </Link>
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="btn-demo-video"
                                id="btn-watch-demo"
                            >
                                <span className="btn-demo-icon">
                                    <i className="fas fa-play"></i>
                                </span>
                                {t('landing.watchDemo')}
                            </button>
                            <Link
                                href="/feedbacks"
                                className="btn-demo-video btn-view-feedbacks"
                                id="btn-view-feedbacks"
                            >
                                <span className="btn-demo-icon">
                                    <i className="fas fa-list"></i>
                                </span>
                                {t('landing.viewFeedbacks')}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="particles" id="particles"></div>
            </section>

            {/* FEATURES SECTION : "Pourquoi choisir Yowyob Feedback ?" */}
            <section id="features" className="features-section">
                <div className="container">
                    <h2 className="section-title animate-on-scroll" data-delay="0">{t('features.title')}</h2>
                    <div className="feature-grid">
                        <div className="feature-item animate-on-scroll" data-delay="0">
                            <div className="feature-img-wrapper" style={{ position: 'relative', height: '200px', width: '100%' }}>
                                <Image
                                    src="/images/porwel.jpg"
                                    alt="Feedbacks Authentiques"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="feature-img"
                                />
                            </div>
                            <h3>{t('features.f1title')}</h3>
                            <p>{t('features.f1desc')}</p>
                        </div>

                        <div className="feature-item animate-on-scroll" data-delay="100">
                            <div className="feature-img-wrapper" style={{ position: 'relative', height: '200px', width: '100%' }}>
                                <Image
                                    src="/images/lesour.jpg"
                                    alt="Diversité des Expériences"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="feature-img"
                                />
                            </div>
                            <h3>{t('features.f2title')}</h3>
                            <p>{t('features.f2desc')}</p>
                        </div>

                        <div className="feature-item animate-on-scroll" data-delay="200">
                            <div className="feature-img-wrapper" style={{ position: 'relative', height: '200px', width: '100%' }}>
                                <Image
                                    src="/images/porw.jpg"
                                    alt="Communauté Engagée"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="feature-img"
                                />
                            </div>
                            <h3>{t('features.f3title')}</h3>
                            <p>{t('features.f3desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEEDBACKS SECTION */}
            <LandingFeed />

            {/* HOW IT WORKS SECTION : "Comment ça marche ?" */}
            <section id="how-it-works" className="how-it-works-section">
                <div className="container">
                    <h2 className="section-title animate-on-scroll" data-delay="50">{t('how.title')}</h2>
                    <div className="steps-grid">
                        <div className="step-item animate-on-scroll" data-delay="0">
                            <span className="step-number">1</span>
                            <h3>{t('how.step1title')}</h3>
                            <p>{t('how.step1desc')}</p>
                        </div>
                        <div className="step-item animate-on-scroll" data-delay="100">
                            <span className="step-number">2</span>
                            <h3>{t('how.step2title')}</h3>
                            <p>{t('how.step2desc')}</p>
                        </div>
                        <div className="step-item animate-on-scroll" data-delay="200">
                            <span className="step-number">3</span>
                            <h3>{t('how.step3title')}</h3>
                            <p>{t('how.step3desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS SECTION : "Ce que nos utilisateurs en disent" */}
            <section id="testimonials" className="testimonials-section">
                <div className="container">
                    {/* Correction : Utilisation d'une formulation plus naturelle */}
                    <h2 className="section-title animate-on-scroll" data-delay="100">{t('testimonials.title')}</h2>
                    <div className="testimonial-slider">
                        <div className="testimonial-item animate-on-scroll" data-delay="0">
                            <p>"Yowyob Feedback helped me find an amazing internship thanks to detailed feedback from previous interns. An essential tool!"</p>
                            <span className="testimonial-author">{t('testimonials.author1')}</span>
                        </div>
                        <div className="testimonial-item animate-on-scroll" data-delay="100">
                            <p>"I was able to share my opinion about my professional training and I hope it helps others. The platform is super easy to use."</p>
                            <span className="testimonial-author">{t('testimonials.author2')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section id="cta" className="cta-section">
                <div className="container">
                    <h2 className="pulse">{t('landing.cta')}</h2>
                    <p>{t('landing.cta')}</p>
                </div>
            </section>

            {/* VIDEO DEMO MODAL — Lazy: la vidéo n'est téléchargée qu'au clic */}
            {showDemoModal && (
                <div className="demo-modal-overlay" onClick={closeDemoModal}>
                    <div className="demo-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="demo-modal-close" onClick={closeDemoModal} aria-label="Fermer">
                            <i className="fas fa-times"></i>
                        </button>
                        <video
                            ref={videoRef}
                            src={DEMO_VIDEO_URL}
                            controls
                            autoPlay
                            preload="none"
                            className="demo-modal-video"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default LandingPage;