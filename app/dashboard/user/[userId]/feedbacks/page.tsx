'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/I18nProvider';
import { feedbackService, FeedbackResponseDTO } from '@/lib/services/feedback.service';
import { userService } from '@/lib/services/user.service';
import { UserResponseDTO } from '@/lib/types/api';
import LandingFeedbackCard from '@/components/LandingFeedbackCard';
import { FeedbackData } from '@/components/FeedbackCard';

import './user-feedbacks.css';

export default function UserFeedbacksPage() {
    const { userId } = useParams<{ userId: string }>();
    const { t } = useTranslation();

    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [user, setUser] = useState<UserResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const load = async () => {
            setLoading(true);
            setError(false);
            try {
                // Load user info AND their project feedbacks in parallel
                const [allUsers, rawFeedbacks] = await Promise.all([
                    userService.getAllUsers().catch(() => [] as UserResponseDTO[]),
                    feedbackService.getFeedbacksByUserProjects(userId),
                ]);

                // Find the target user
                const found = allUsers.find((u: UserResponseDTO) => u.user_id === userId) || null;
                setUser(found);

                // Map to FeedbackData
                const mapped: FeedbackData[] = rawFeedbacks.map(fb => ({
                    id: fb.feedback_id,
                    content: fb.content,
                    createdAt: fb.feedback_date_time,
                    likes: fb.number_of_likes,
                    liked: false,
                    comments: Array(fb.number_of_comments).fill(null),
                    attachments: fb.attachments,
                    project: { id: fb.target_project_id, name: fb.project_name },
                    author: {
                        name: fb.member_pseudo,
                        avatar: fb.project_logo || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png',
                    },
                    type: 'person',
                }));

                const sorted = mapped.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setFeedbacks(sorted);
            } catch (err) {
                console.error('Failed to load user feedbacks:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [userId]);

    const isOrg = user?.user_type === 'ORGANIZATION' || (!user?.user_firstname && user?.user_lastname);
    const displayName = user
        ? (isOrg ? user.user_lastname : `${user.user_firstname ?? ''} ${user.user_lastname ?? ''}`.trim())
        : '...';
    const role = isOrg
        ? (user?.domain || t('userFeedbacksPage.organization'))
        : (user?.occupation || user?.domain || t('userFeedbacksPage.member'));

    return (
        <div className="user-feedbacks-page">
            {/* ─── HEADER ─── */}
            <header className="uf-header">
                <div className="uf-header-inner">
                    <Link href="/dashboard/feed" className="uf-back-btn">
                        <i className="fas fa-arrow-left" />
                        {t('userFeedbacksPage.backToFeed')}
                    </Link>

                    <div className="uf-avatar-wrapper">
                        <img
                            src={user?.user_logo || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png'}
                            alt={displayName}
                            className="uf-avatar"
                        />
                        <div className="uf-avatar-ring" />
                    </div>

                    <h1 className="uf-user-name">{displayName}</h1>
                    <p className="uf-user-role">{role}</p>

                    <span className="uf-badge">
                        <i className="fas fa-comments" />
                        {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </header>

            {/* ─── CONTENT ─── */}
            <main className="uf-content">
                <h2 className="uf-section-title">{t('userFeedbacksPage.sectionTitle')}</h2>

                {loading ? (
                    <div className="uf-loader">
                        <div className="uf-spinner" />
                        <span>{t('userFeedbacksPage.loading')}</span>
                    </div>
                ) : error ? (
                    <div className="uf-empty">
                        <i className="fas fa-exclamation-circle" />
                        <h3>{t('userFeedbacksPage.error')}</h3>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="uf-empty">
                        <i className="fas fa-comment-slash" />
                        <h3>{t('userFeedbacksPage.noFeedbacks')}</h3>
                        <p>{displayName}</p>
                    </div>
                ) : (
                    <div className="uf-masonry-grid">
                        {feedbacks.map((fb, index) => (
                            <motion.div
                                key={fb.id}
                                className="uf-masonry-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.06, 0.5) }}
                            >
                                <LandingFeedbackCard data={fb} />

                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
