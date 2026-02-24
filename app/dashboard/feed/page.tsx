"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/I18nProvider';
import FeedbackCard, { FeedbackData } from '@/components/FeedbackCard';
import { feedService, AggregatedFeed } from '@/lib/services/feedService';
import { userService } from '@/lib/services/user.service';
import { likeService } from '@/lib/services/like.service';
import { subscriptionService } from '@/lib/services/subscription.service';

export default function FeedPage() {
    const { t } = useTranslation();
    const [feedData, setFeedData] = useState<AggregatedFeed>({ feedbacks: [], users: [] });
    const [userLikes, setUserLikes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());
    const [subscribingTo, setSubscribingTo] = useState<Set<string>>(new Set());
    const [unsubscribingFrom, setUnsubscribingFrom] = useState<Set<string>>(new Set());
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchFeedData = async () => {
            setLoading(true);
            try {
                const [feed, allUsers, currentUser] = await Promise.all([
                    feedService.getGlobalFeed(),
                    userService.getAllUsers(),
                    userService.getCurrentUser().catch(() => null)
                ]);

                if (currentUser) {
                    const likes = await likeService.getLikesByUser(currentUser.user_id);
                    setUserLikes(likes.map(l => l.feedback_id));

                    // Charger les abonnements existants
                    if (allUsers && allUsers.length > 0) {
                        const subscriptionStatuses = await Promise.all(
                            allUsers.map(user =>
                                subscriptionService.checkSubscription(user.user_id)
                                    .then(isSubscribed => ({ userId: user.user_id, isSubscribed }))
                                    .catch(() => ({ userId: user.user_id, isSubscribed: false }))
                            )
                        );
                        const followingIds = new Set(
                            subscriptionStatuses
                                .filter(status => status.isSubscribed)
                                .map(status => status.userId)
                        );
                        setSubscriptions(followingIds);
                    }
                }

                setFeedData({
                    feedbacks: feed.feedbacks,
                    users: allUsers
                });
            } catch (err) {
                console.error("Failed to load feed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedData();
    }, []);

    const handleDeleteFeedback = (feedbackId: string) => {
        setFeedData(prev => ({
            ...prev,
            feedbacks: prev.feedbacks.filter(f => f.feedback_id !== feedbackId)
        }));
    };

    const handleSubscribe = async (userId: string) => {
        if (subscribingTo.has(userId)) return;

        setSubscribingTo(prev => new Set(prev).add(userId));
        try {
            await subscriptionService.subscribe(userId);
            setSubscriptions(prev => new Set(prev).add(userId));
        } catch (err: any) {
            if (err.response?.status === 400 || err.message?.includes('déjà abonné')) {
                setSubscriptions(prev => new Set(prev).add(userId));
                console.warn("User already subscribed", userId);
            } else {
                console.error("Failed to subscribe", err);
            }
        } finally {
            setSubscribingTo(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    const handleUnsubscribe = async (userId: string) => {
        if (unsubscribingFrom.has(userId)) return;

        setUnsubscribingFrom(prev => new Set(prev).add(userId));
        try {
            await subscriptionService.unsubscribe(userId);
            setSubscriptions(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        } catch (err: any) {
            console.error("Failed to unsubscribe", err);
        } finally {
            setUnsubscribingFrom(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    const feedbacks = feedData.feedbacks
        .filter(fb => {
            const authorName = (fb.member_pseudo || fb.author?.user_lastname || '').toLowerCase();
            return !authorName.includes('yowbot');
        })
        .map((fb): FeedbackData => ({
            id: fb.feedback_id,
            author: {
                name: fb.member_pseudo || fb.author?.user_lastname || t('feed.defaultRole'),
                avatar: fb.project_logo || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png'
            },
            createdAt: fb.feedback_date_time,
            content: fb.content,
            likes: fb.number_of_likes,
            liked: userLikes.includes(fb.feedback_id),
            project: { name: fb.project_name, id: fb.target_project_id },
            comments: [],
            attachments: fb.attachments
        }));

    const filteredUsers = feedData.users.filter(user => {
        const name = `${user.user_firstname} ${user.user_lastname}`.toLowerCase();
        return !name.includes('yowbot') && !user.user_lastname?.toLowerCase().includes('yowbot');
    });

    const displayedUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 4);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4FB 100%)',
            padding: '40px 20px',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <link rel="stylesheet" href="/feed.css" />

                {/* --- HEADER --- */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '60px', textAlign: 'center' }}
                    ref={headerRef}
                >
                    <div style={{ position: 'relative', marginBottom: '25px' }}>
                        <div
                            style={{
                                background: 'white', border: '3px solid #7C3AED', borderRadius: '50%', padding: '8px',
                                boxShadow: '0 20px 40px rgba(124, 58, 237, 0.2)',
                                width: '140px', height: '140px', overflow: 'hidden', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1
                            }}
                        >
                            <i className="fas fa-globe-americas" style={{ fontSize: '4.5rem', color: '#7C3AED' }}></i>
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{
                                position: 'absolute', top: '-10px', left: '-10px', right: '-10px', bottom: '-10px',
                                border: '2px solid #7C3AED', borderRadius: '50%', zIndex: 0
                            }}
                        />
                    </div>

                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: '#111827',
                        letterSpacing: '-0.025em',
                        marginBottom: '10px'
                    }}>
                        {t('feed.title')}
                    </h1>
                    <p style={{
                        color: '#4B5563',
                        fontSize: '1.2rem',
                        fontWeight: 500,
                        maxWidth: '600px',
                        lineHeight: 1.6
                    }}>
                        {t('feed.explore')}
                    </p>
                </motion.div>

                {/* --- FEEDBACKS SECTION --- */}
                <section style={{ marginBottom: '60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                        <div style={{ width: '4px', height: '24px', background: '#7C3AED', borderRadius: '2px' }}></div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem', color: '#111827' }}>
                            {t('feed.recentFeedback')}
                        </h3>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                            <div className="loading-spinner"></div>
                        </div>
                    ) : feedbacks.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {feedbacks.map((data, idx) => (
                                <motion.div
                                    key={data.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <FeedbackCard
                                        data={data}
                                        onDelete={handleDeleteFeedback}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center', padding: '60px 40px',
                            background: 'rgba(255, 255, 255, 0.5)', borderRadius: '24px',
                            border: '2px dashed #E5E7EB', color: '#6B7280'
                        }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{t('feed.noRecentFeedback')}</p>
                        </div>
                    )}
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '60px 0' }} />

                {/* --- USERS SECTION --- */}
                <section style={{ paddingBottom: '80px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                        <div style={{ width: '4px', height: '24px', background: '#7C3AED', borderRadius: '2px' }}></div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem', color: '#111827' }}>
                            {t('feed.featuredTitle')}
                        </h3>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '24px'
                    }}>
                        <AnimatePresence>
                            {displayedUsers.map((user, idx) => {
                                const isOrg = user.user_type === 'ORGANIZATION' || (!user.user_firstname && user.user_lastname);
                                const displayName = isOrg ? user.user_lastname : `${user.user_firstname} ${user.user_lastname}`;
                                const subTitle = isOrg ? (user.domain || t('feed.organizationRole')) : (user.occupation || user.domain || t('feed.defaultRole'));
                                const isSubscribed = subscriptions.has(user.user_id);
                                const isSubscribing = subscribingTo.has(user.user_id);

                                return (
                                    <motion.div
                                        key={user.user_id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: (idx % 4) * 0.05 }}
                                        style={{
                                            background: 'white', borderRadius: '24px', padding: '30px 20px',
                                            textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                            border: '1px solid #F3F4F6', position: 'relative', overflow: 'hidden'
                                        }}
                                        className="user-card-premium"
                                    >
                                        <Link
                                            href={`/dashboard/user/${user.user_id}/feedbacks`}
                                            style={{ textDecoration: 'none', display: 'block' }}
                                            title={displayName}
                                        >
                                            <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 20px', cursor: 'pointer' }}>
                                                <img
                                                    src={user.user_logo || "https://i.ibb.co/Qf983vG/avatar-placeholder.png"}
                                                    alt={displayName}
                                                    style={{
                                                        width: '100%', height: '100%', borderRadius: '50%',
                                                        border: '4px solid #F3F4F6', objectFit: 'cover',
                                                        transition: 'border-color 0.25s',
                                                    }}
                                                    onMouseOver={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                                                    onMouseOut={e => (e.currentTarget.style.borderColor = '#F3F4F6')}
                                                />
                                                {isOrg && (
                                                    <div style={{
                                                        position: 'absolute', bottom: '0', right: '0',
                                                        background: 'white', borderRadius: '50%', padding: '3px'
                                                    }}>
                                                        <i className="fas fa-check-circle" style={{ color: '#7C3AED', fontSize: '1.2rem' }}></i>
                                                    </div>
                                                )}
                                            </div>
                                            <h4 style={{ margin: '0 0 8px 0', color: '#7C3AED', fontSize: '1.2rem', fontWeight: 700 }}>
                                                {displayName}
                                            </h4>
                                        </Link>
                                        <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '20px', fontWeight: 500 }}>{subTitle}</p>
                                        {isSubscribed ? (
                                            <button
                                                className="btn-unsubscribe-premium"
                                                onClick={() => handleUnsubscribe(user.user_id)}
                                                disabled={unsubscribingFrom.has(user.user_id)}
                                            >
                                                <i className="fas fa-check"></i>
                                                {unsubscribingFrom.has(user.user_id)
                                                    ? t('feed.unsubscribing')
                                                    : t('feed.unsubscribe')
                                                }
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-subscribe-premium"
                                                onClick={() => handleSubscribe(user.user_id)}
                                                disabled={subscribingTo.has(user.user_id)}
                                            >
                                                <i className="fas fa-plus"></i>
                                                {subscribingTo.has(user.user_id)
                                                    ? t('feed.subscribing')
                                                    : t('feed.subscribe')
                                                }
                                            </button>
                                        )}
                                        <Link
                                            href={`/dashboard/user/${user.user_id}/feedbacks`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                marginTop: '10px',
                                                padding: '10px',
                                                borderRadius: '14px',
                                                border: '2px solid #7C3AED',
                                                color: '#7C3AED',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                textDecoration: 'none',
                                                transition: 'all 0.25s ease',
                                            }}
                                            onMouseOver={e => {
                                                (e.currentTarget as HTMLAnchorElement).style.background = '#7C3AED';
                                                (e.currentTarget as HTMLAnchorElement).style.color = 'white';
                                            }}
                                            onMouseOut={e => {
                                                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                                                (e.currentTarget as HTMLAnchorElement).style.color = '#7C3AED';
                                            }}
                                        >
                                            <i className="fas fa-comments" />
                                            {t('userFeedbacksPage.sectionTitle')}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {filteredUsers.length > 4 && (
                        <motion.div
                            layout
                            style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}
                        >
                            <button
                                onClick={() => setShowAllUsers(!showAllUsers)}
                                style={{
                                    background: '#111827', color: 'white', border: 'none',
                                    borderRadius: '50px', padding: '16px 40px', fontWeight: 700,
                                    fontSize: '1rem', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', gap: '12px', transition: 'all 0.3s ease',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                                }}
                            >
                                {showAllUsers ? (
                                    <> <i className="fas fa-chevron-up"></i> {t('feed.showLess')} </>
                                ) : (
                                    <> <i className="fas fa-chevron-down"></i> {t('feed.showMore')} ({filteredUsers.length - 4}) </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                            {t('feed.noMembers')}
                        </div>
                    )}
                </section>
            </div>

            <style jsx>{`
                .loading-spinner {
                    width: '40px';
                    height: '40px';
                    border: '3px solid #7C3AED';
                    border-top-color: 'transparent';
                    border-radius: '50%';
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 
                    to { transform: rotate(360deg); } 
                }
                .user-card-premium {
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .user-card-premium:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1) !important;
                    border-color: #7C3AED !important;
                }
                .btn-subscribe-premium {
                    background: #7C3AED;
                    color: white;
                    border: none;
                    width: 100%;
                    border-radius: 14px;
                    padding: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }
                .btn-subscribe-premium:hover:not(:disabled) {
                    background: #6D28D9;
                    box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
                }
                .btn-subscribe-premium:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .btn-subscribe-premium.subscribed {
                    background: #10B981;
                }
                .btn-subscribe-premium.subscribed:hover {
                    background: #059669;
                }
                .btn-unsubscribe-premium {
                    background: #EF4444;
                    color: white;
                    border: none;
                    width: 100%;
                    border-radius: 14px;
                    padding: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }
                .btn-unsubscribe-premium:hover:not(:disabled) {
                    background: #DC2626;
                    box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
                }
                .btn-unsubscribe-premium:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .btn-unsubscribe-premium {
                    background: #10B981;
                    color: white;
                    border: none;
                    width: 100%;
                    border-radius: 14px;
                    padding: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }
                .btn-unsubscribe-premium:hover:not(:disabled) {
                    background: #059669;
                    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
                }
                .btn-unsubscribe-premium:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>

            <Script src="/feed.js" strategy="lazyOnload" />
        </div>
    );
}