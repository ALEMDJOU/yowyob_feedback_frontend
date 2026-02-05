"use client";

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/I18nProvider';
import FeedbackCard, { FeedbackData } from '@/components/FeedbackCard';
import { feedService, AggregatedFeed } from '@/lib/services/feedService';
import { userService } from '@/lib/services/user.service';
import { likeService } from '@/lib/services/like.service';

export default function FeedPage() {
    const { t } = useTranslation();
    const [feedData, setFeedData] = useState<AggregatedFeed>({ feedbacks: [], users: [] });
    const [userLikes, setUserLikes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllUsers, setShowAllUsers] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchFeedData = async () => {
            setLoading(true);
            try {
                // Fetch both global feed (for feedbacks) and all users (for featured members)
                const [feed, allUsers, currentUser] = await Promise.all([
                    feedService.getGlobalFeed(),
                    userService.getAllUsers(),
                    userService.getCurrentUser().catch(() => null)
                ]);

                if (currentUser) {
                    const likes = await likeService.getLikesByUser(currentUser.user_id);
                    setUserLikes(likes.map(l => l.feedback_id));
                }

                // Merge or prioritize as needed. Here we use users from getAllUsers for the featured section.
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

    // Transformation pour le composant FeedbackCard
    // Filter out Yowbot from feedbacks content if present
    const feedbacks = feedData.feedbacks
        .filter(fb => {
            const authorName = (fb.member_pseudo || fb.author?.user_lastname || '').toLowerCase();
            return !authorName.includes('yowbot');
        })
        .map((fb): FeedbackData => ({
            id: fb.feedback_id,
            author: {
                name: fb.member_pseudo || fb.author?.user_lastname || 'Membre',
                avatar: fb.project_logo || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png'
            },
            createdAt: fb.feedback_date_time,
            content: fb.content,
            likes: fb.number_of_likes,
            liked: userLikes.includes(fb.feedback_id),
            project: { name: fb.project_name, id: fb.target_project_id },
            comments: []
        }));

    // Filter out Yowbot from users list
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
                        Explorez les dernières activités de Yowyob Feedback
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
                            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Aucun feedback récent à afficher.</p>
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
                                const subTitle = isOrg ? (user.domain || 'Organisation') : (user.occupation || user.domain || 'Membre');

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
                                        <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 20px' }}>
                                            <img
                                                src={user.user_logo || "https://i.ibb.co/Qf983vG/avatar-placeholder.png"}
                                                alt={displayName}
                                                style={{
                                                    width: '100%', height: '100%', borderRadius: '50%',
                                                    border: '4px solid #F3F4F6', objectFit: 'cover'
                                                }}
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
                                        <h4 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '1.2rem', fontWeight: 700 }}>
                                            {displayName}
                                        </h4>
                                        <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '20px', fontWeight: 500 }}>{subTitle}</p>
                                        <button className="btn-subscribe-premium">
                                            <i className="fas fa-plus"></i> {t('feed.subscribe')}
                                        </button>
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
                                    <> <i className="fas fa-chevron-up"></i> Voir moins </>
                                ) : (
                                    <> <i className="fas fa-chevron-down"></i> Voir plus ({filteredUsers.length - 4}) </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                            Aucun membre à afficher.
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
                .btn-subscribe-premium:hover {
                    background: #6D28D9;
                    box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
                }
            `}</style>

            <Script src="/feed.js" strategy="lazyOnload" />
        </div>
    );
}