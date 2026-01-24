"use client";

import React from 'react';
import Script from 'next/script';
import { useTranslation } from '@/components/I18nProvider';
import FeedbackCard, { FeedbackData } from '@/components/FeedbackCard';

export default function FollowPage() {
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
                    replies: []
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
        },
        {
            id: '3',
            author: 'Sophie Martin',
            authorAvatar: 'https://i.ibb.co/Qf983vG/avatar-placeholder.png',
            time: '2 heures',
            content: 'Excellente expérience avec l\'équipe de Design Studio ! Ils ont vraiment écouté nos besoins et livré un travail de qualité.',
            likes: 28,
            liked: false,
            comments: []
        }
    ];

    return (
        <>
            <link rel="stylesheet" href="/feed.css" />

            <header className="content-header">
                <div className="header-title">
                    <i className="fas fa-users title-icon"></i>
                    <h1>Abonnements</h1>
                </div>
            </header>

            <div className="control-bar">
                <div className="search-box">
                    <i className="fas fa-search search-icon"></i>
                    <input type="text" placeholder={t('feed.searchPlaceholder')} />
                </div>
            </div>

            <section className="feedback-section">
                {initialFeedbacks.map(data => (
                    <FeedbackCard key={data.id} data={data} />
                ))}
            </section>

            <Script src="/feed.js" strategy="lazyOnload" />
        </>
    );
}
