'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '../../components/I18nProvider';
import { landingfeedService } from '../../lib/services/landingfeed.service';
import LandingFeedbackCard from '../../components/LandingFeedbackCard';
import { FeedbackData } from '../../components/FeedbackCard';

import './feedbacks.css';

const FeedbacksPage = () => {
    const { t } = useTranslation();
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const data = await landingfeedService.getAllFeedbacks();

                const mappedFeedbacks: FeedbackData[] = data.map(fb => ({
                    id: fb.feedback_id,
                    content: fb.content,
                    createdAt: fb.feedback_date_time,
                    likes: fb.number_of_likes,
                    liked: false,
                    comments: Array(fb.number_of_comments).fill(null),
                    attachments: fb.attachments,
                    project: {
                        id: fb.target_project_id,
                        name: fb.project_name
                    },
                    author: {
                        name: fb.member_pseudo,
                        avatar: fb.project_logo || '/images/default-avatar.png'
                    },
                    type: 'person'
                }));

                const sorted = mappedFeedbacks.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setFeedbacks(sorted);
            } catch (err) {
                console.error("Failed to fetch feedbacks:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    return (
        <div className="feedbacks-page">
            <header className="feedbacks-header">
                <div className="container">
                    <Link href="/" className="back-link">
                        <i className="fas fa-arrow-left"></i>
                        {t('feedbacksPage.backToHome')}
                    </Link>
                    <h1 className="feedbacks-title">{t('feedbacksPage.title')}</h1>
                    <p className="feedbacks-subtitle">{t('feedbacksPage.subtitle')}</p>
                </div>
            </header>

            <main className="feedbacks-container">
                {loading ? (
                    <div className="feedbacks-loader">
                        <div className="loader-spinner"></div>
                        <p>{t('feedbacksPage.loading')}</p>
                    </div>
                ) : error ? (
                    <div className="empty-state">
                        <i className="fas fa-exclamation-triangle"></i>
                        <h3>{t('feedbacksPage.error')}</h3>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-comment-slash"></i>
                        <h3>{t('feedbacksPage.noFeedbacks')}</h3>
                    </div>
                ) : (
                    <div className="masonry-grid">
                        {feedbacks.map((fb, index) => (
                            <div key={fb.id} className="masonry-item">
                                <LandingFeedbackCard data={fb} />

                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default FeedbacksPage;
