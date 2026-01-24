"use client";

import React from 'react';
import Script from 'next/script';
import { useTranslation } from '@/components/I18nProvider';
import FeedbackCard, { FeedbackData } from '@/components/FeedbackCard';

export default function FeedPage() {
    const { t } = useTranslation();

    const initialFeedbacks: FeedbackData[] = [
        {
            id: '1',
            author: 'Tech Innov S.A.',
            authorAvatar: 'https://i.ibb.co/6P8N9zR/company-logo.png',
            time: '5 minutes',
            content: 'Nous sommes ravis d\'annoncer la sortie de notre nouveau produit "Quantum Leap" ! Vos premiers feedbacks sont précieux. Dites-nous ce que vous en pensez !',
            likes: 12,
            liked: false,
            comments: [
                {
                    id: 'c1',
                    author: 'Marie Dubois',
                    text: 'Très intéressant ! J\'ai hâte de tester 🎉',
                    avatar: 'https://i.ibb.co/Qf983vG/avatar-placeholder.png',
                    likes: 3,
                    liked: false,
                    replies: [
                        {
                            id: 'c1-r1',
                            author: 'Tech Innov S.A.',
                            text: 'Merci Marie ! N\'hésitez pas à nous faire un retour détaillé.',
                            avatar: 'https://i.ibb.co/6P8N9zR/company-logo.png',
                            likes: 1,
                            liked: false,
                            replies: []
                        }
                    ]
                },
                {
                    id: 'c2',
                    author: 'Pierre Martin',
                    text: 'Excellente initiative !',
                    likes: 0,
                    liked: false,
                    replies: []
                }
            ]
        },
        {
            id: '2',
            author: 'Jean Duport',
            authorAvatar: 'https://i.ibb.co/Qf983vG/avatar-placeholder.png',
            time: '1 heure',
            content: 'Le service client de Global Corp est excellent. J\'ai posté un feedback sur leur produit hier et j\'ai eu une réponse en 30 minutes. Bravo !',
            likes: 45,
            liked: false,
            comments: [
                {
                    id: 'c3',
                    author: 'Sophie Laurent',
                    text: 'Je confirme, leur service est top ! 👍',
                    likes: 5,
                    liked: true,
                    replies: []
                }
            ]
        }
    ];

    return (
        <>
            <link rel="stylesheet" href="/feed.css" />

            <header className="content-header">
                <div className="header-title">
                    <i className="fas fa-globe-americas title-icon"></i>
                    <h1>{t('feed.title')}</h1>
                </div>
            </header>

            <div className="control-bar">
                <div className="search-box">
                    <i className="fas fa-search search-icon"></i>
                    <input type="text" placeholder={t('feed.searchPlaceholder')} />
                </div>
            </div>

            <section className="featured-members-section">
                <h2>{t('feed.featuredTitle')}</h2>
                <div className="members-grid-container">
                    <div className="member-card person featured-card" data-id="1">
                        <img src="https://i.ibb.co/Qf983vG/avatar-placeholder.png" alt="Henri Fofack" width={60} height={60} className="card-avatar" />
                        <div className="card-info"><span className="card-name">Henri Fofack</span></div>
                        <button className="subscribe-btn"><i className="fas fa-rss"></i> {t('feed.subscribe')}</button>
                    </div>

                    <div className="member-card business featured-card" data-id="2">
                        <img src="https://i.ibb.co/6P8N9zR/company-logo.png" alt="Tech Innov S.A." width={60} height={60} className="card-avatar" />
                        <div className="card-info"><span className="card-name">Tech Innov S.A.</span></div>
                        <button className="subscribe-btn"><i className="fas fa-rss"></i> {t('feed.subscribe')}</button>
                    </div>
                    {/* Add more simulated cards if needed */}
                    <div className="member-card person featured-card" data-id="3">
                        <img src="https://i.ibb.co/Qf983vG/avatar-placeholder.png" alt="Sophie Martin" width={60} height={60} className="card-avatar" />
                        <div className="card-info"><span className="card-name">Sophie Martin</span></div>
                        <button className="subscribe-btn"><i className="fas fa-rss"></i> {t('feed.subscribe')}</button>
                    </div>
                </div>
            </section>

            <hr className="section-separator" />

            <section className="feedback-section">
                <h2>{t('feed.recentFeedback')}</h2>
                {initialFeedbacks.map(data => (
                    <FeedbackCard key={data.id} data={data} />
                ))}
            </section>

            <Script src="/feed.js" strategy="lazyOnload" />
        </>
    );
}
