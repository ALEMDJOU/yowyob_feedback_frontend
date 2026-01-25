"use client";

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useTranslation } from '@/components/I18nProvider';
import FeedbackCard, { FeedbackData } from '@/components/FeedbackCard';
import { feedbackService } from '@/lib/services/feedback.service';
import { userService } from '@/lib/services/user.service';
import { UserResponseDTO } from '@/lib/types/api';

export default function FeedPage() {
    const { t } = useTranslation();
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedData = async () => {
            setLoading(true);
            try {
                const user = await userService.getCurrentUser();
                if (user?.user_id) {
                    const realFeedbacks = await feedbackService.getFeedbacksByUserProjects(user.user_id);
                    const transformed = realFeedbacks.map((fb): FeedbackData => ({
                        id: fb.feedback_id,
                        author: {
                            name: fb.member_pseudo || 'Membre',
                            avatar: `https://i.pravatar.cc/150?u=${fb.member_id}`
                        },
                        createdAt: fb.feedback_date_time,
                        content: fb.content,
                        likes: fb.number_of_likes,
                        liked: false,
                        project: { name: fb.project_name, id: fb.target_project_id },
                        comments: [] // FeedbackResponseDTO doesn't include comments in this list
                    }));
                    setFeedbacks(transformed);
                }
            } catch (err) {
                console.error("Failed to load feed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedData();
    }, []);

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
                </div>
            </section>

            <hr className="section-separator" />

            <section className="feedback-section">
                <h2>{t('feed.recentFeedback')}</h2>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Chargement du fil d'actualité...</div>
                ) : feedbacks.length > 0 ? (
                    feedbacks.map(data => (
                        <FeedbackCard key={data.id} data={data} />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', color: '#6B7280' }}>
                        Aucun feedback récent à afficher.
                    </div>
                )}
            </section>

            <Script src="/feed.js" strategy="lazyOnload" />
        </>
    );
}
