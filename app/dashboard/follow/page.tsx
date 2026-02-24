"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/components/I18nProvider';
import { subscriptionService } from '@/lib/services/subscription.service';
import { PersonDTO, SubscriptionStatsDTO } from '@/lib/types/api';
import Image from 'next/image';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    UserMinus,
    UserPlus,
    Loader2,
    UserX,
    ChevronRight,
    Search,
    UserCheck
} from 'lucide-react';

type TabType = 'followers' | 'following';

export default function FollowPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('following');
    const [stats, setStats] = useState<SubscriptionStatsDTO | null>(null);
    const [users, setUsers] = useState<PersonDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        setUsers([]);
        setPage(0);
        setHasMore(true);
        loadUsers(0, activeTab);
    }, [activeTab]);

    const loadStats = async () => {
        try {
            const data = await subscriptionService.getSubscriptionStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    };

    const loadUsers = async (pageToLoad: number, type: TabType) => {
        setLoading(true);
        try {
            const response = type === 'following'
                ? await subscriptionService.getFollowing(pageToLoad)
                : await subscriptionService.getFollowers(pageToLoad);

            if (pageToLoad === 0) {
                setUsers(response.content);
            } else {
                setUsers(prev => [...prev, ...response.content]);
            }
            setHasMore(response.number + 1 < response.totalPages);
        } catch (error) {
            console.error("Failed to load users", error);
            toast.error(t('common.errorLoadingUsers'));
        } finally {
            setLoading(false);
        }
    };

    const handleUnsubscribe = async (userId: string) => {
        try {
            await subscriptionService.unsubscribe(userId);
            toast.success(t('common.unsubscribed'));
            setUsers(prev => prev.filter(u => u.userId !== userId));
            loadStats();
        } catch (error) {
            toast.error(t('common.errorUnsubscribing'));
        }
    };

    const handleSubscribe = async (userId: string) => {
        try {
            await subscriptionService.subscribe(userId);
            toast.success(t('common.subscribed'));
            loadStats();
        } catch (error) {
            toast.error(t('common.errorSubscribing'));
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="follow-page-container"
            style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}
        >
            <style jsx>{`
                /* Base Styles with Fluid Typography */
                .follow-page-container {
                    --container-padding: clamp(15px, 4vw, 40px);
                    --gap-small: clamp(12px, 2vw, 16px);
                    --gap-medium: clamp(16px, 3vw, 20px);
                    --gap-large: clamp(20px, 4vw, 32px);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
                    gap: var(--gap-medium);
                    margin-bottom: var(--gap-large);
                }

                .user-card {
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    align-items: center;
                    gap: var(--gap-medium);
                    padding: clamp(12px, 3vw, 20px);
                    background: var(--card-bg);
                    border-radius: clamp(12px, 2vw, 20px);
                    border: 1px solid var(--border-color);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: all 0.2s ease;
                    min-height: 80px;
                }

                /* Mobile First: 320px - 479px (Small Phones) */
                @media (max-width: 479px) {
                    .follow-page-container {
                        padding: 15px 12px !important;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .header-title {
                        flex-direction: column;
                        gap: 12px !important;
                        text-align: center;
                    }

                    .header-title h1 {
                        font-size: 22px !important;
                        line-height: 1.2 !important;
                    }

                    .user-card {
                        grid-template-columns: auto 1fr;
                        grid-template-rows: auto auto;
                        gap: 12px 10px;
                        padding: 12px;
                    }

                    .user-card button {
                        flex: 1;
                        padding: 10px 12px !important;
                        margin: 0 !important;
                        min-height: 44px;
                        font-size: 13px !important;
                    }

                    .load-more-button {
                        width: 100%;
                        padding: 12px 20px !important;
                    }
                }

                /* Tablet Portrait: 480px - 767px */
                @media (min-width: 480px) and (max-width: 767px) {
                    .follow-page-container {
                        padding: 25px 20px !important;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;
                    }

                    .header-title h1 {
                        font-size: 26px !important;
                    }

                    .user-card {
                        padding: 16px;
                    }
                }

                /* Tablet Landscape & Small Desktop: 768px - 1023px */
                @media (min-width: 768px) and (max-width: 1023px) {
                    .follow-page-container {
                        padding: 32px 25px !important;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 18px;
                    }

                    .header-title h1 {
                        font-size: 28px !important;
                    }

                    .user-card {
                        padding: 18px;
                    }
                }

                /* Large Desktop: 1024px+ */
                @media (min-width: 1024px) {
                    .follow-page-container {
                        padding: 40px 20px !important;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                    }

                    .user-card:hover {
                        transform: translateX(4px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    }
                }

                /* Landscape Orientation Specific */
                @media (max-height: 600px) and (orientation: landscape) {
                    .follow-page-container {
                        padding: 20px 15px !important;
                    }

                    .stats-grid {
                        margin-bottom: 20px;
                    }
                }

                /* Reduced Motion */
                @media (prefers-reduced-motion: reduce) {
                    .user-card {
                        transition: none !important;
                    }
                }

                /* Dark Mode Optimization */
                @media (prefers-color-scheme: dark) {
                    .user-card {
                        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
                    }
                }
            `}</style>

            {/* Header épuré avec l'icône de la cloche animée */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '60px', textAlign: 'center' }}
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
                        <Bell size={70} color="#7C3AED" strokeWidth={2} style={{ marginBottom: '5px' }} />
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
                    {t('follow.title')}
                </h1>
            </motion.div>

            {/* Stats Section */}
            <div className="stats-grid">
                {[
                    { label: t('follow.following'), count: stats?.followersCount || 0, icon: <UserCheck size={18} /> },
                    { label: t('follow.followers'), count: stats?.followingCount || 0, icon: <UserPlus size={18} /> }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5, boxShadow: '0 12px 20px -5px rgba(0,0,0,0.1)' }}
                        style={{
                            background: 'var(--card-bg)',
                            padding: '24px',
                            borderRadius: '24px',
                            textAlign: 'center',
                            border: '1px solid var(--border-color)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <div style={{
                            color: 'var(--primary-color)',
                            background: 'rgba(var(--primary-rgb), 0.1)',
                            padding: '8px',
                            borderRadius: '12px',
                            marginBottom: '4px'
                        }}>
                            {stat.icon}
                        </div>
                        <span style={{ fontSize: '36px', fontWeight: '900', display: 'block', color: 'var(--text-main)', lineHeight: 1 }}>
                            {stat.count}
                        </span>
                        <span style={{
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {stat.label}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Tabs - Style Segmented Control */}
            <div style={{
                display: 'flex',
                background: 'var(--secondary-bg)',
                padding: '6px',
                borderRadius: '16px',
                marginBottom: '32px',
                position: 'relative'
            }}>
                {(['following', 'followers'] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '14px',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '700',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: activeTab === tab ? 'var(--card-bg)' : 'transparent',
                            color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
                            boxShadow: activeTab === tab ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {tab === 'following' ? <UserPlus size={16} /> : <UserCheck size={16} />}
                        {tab === 'following' ? t('follow.following') : t('follow.followers')}
                    </button>
                ))}
            </div>

            {/* User List */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="user-list"
                >
                    {users.length === 0 && !loading ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                textAlign: 'center',
                                padding: '80px 40px',
                                background: 'var(--card-bg)',
                                borderRadius: '24px',
                                border: '1px dashed var(--border-color)',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            <div style={{
                                background: 'var(--secondary-bg)',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px'
                            }}>
                                <UserX size={40} style={{ opacity: 0.5 }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                                {t('follow.empty')}
                            </h3>
                            <p style={{ fontSize: '15px', maxWidth: '300px', margin: '0 auto' }}>
                                {activeTab === 'following'
                                    ? t('follow.emptyFollowingDesc')
                                    : t('follow.emptyFollowersDesc')}
                            </p>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {users.map(user => (
                                <motion.div
                                    key={user.userId}
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.01, x: 5 }}
                                    className="user-card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '20px',
                                        background: 'var(--card-bg)',
                                        borderRadius: '20px',
                                        border: '1px solid var(--border-color)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    }}
                                >
                                    <div style={{ position: 'relative', width: '64px', height: '64px', marginRight: '20px' }}>
                                        <Image
                                            src={user.profileImage || "/default-avatar.png"}
                                            alt={user.firstName}
                                            fill
                                            style={{
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '3px solid var(--secondary-bg)',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            width: '16px',
                                            height: '16px',
                                            background: '#10b981',
                                            border: '3px solid var(--card-bg)',
                                            borderRadius: '50%'
                                        }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{
                                            margin: 0,
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: 'var(--text-main)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            {user.firstName} {user.lastName}
                                        </h4>
                                        <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                                            @{user.email?.split('@')[0] || 'user'}
                                        </p>
                                        {user.occupation && (
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    background: 'rgba(var(--primary-rgb), 0.1)',
                                                    color: 'var(--primary-color)',
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {user.occupation}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {activeTab === 'following' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleUnsubscribe(user.userId)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 18px',
                                                borderRadius: '12px',
                                                border: '1.5px solid var(--danger-color, #ef4444)',
                                                background: 'transparent',
                                                color: 'var(--danger-color, #ef4444)',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                transition: 'all 0.2s ease',
                                                marginLeft: '12px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--danger-color, #ef4444)';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'var(--danger-color, #ef4444)';
                                            }}
                                        >
                                            <UserMinus size={16} />
                                            <span className="button-text">{t('follow.unsubscribe')}</span>
                                        </motion.button>
                                    )}

                                    <div style={{ marginLeft: '12px', color: 'var(--text-muted)', opacity: 0.3 }}>
                                        <ChevronRight size={20} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Loader2 className="spinner" size={32} style={{ animation: 'spin 1s linear infinite' }} />
                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>{t('common.loading')}</span>
                </div>
            )}

            {!loading && hasMore && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', marginTop: '40px' }}
                >
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.25)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            const nextPage = page + 1;
                            setPage(nextPage);
                            loadUsers(nextPage, activeTab);
                        }}
                        style={{
                            padding: '14px 40px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.2)'
                        }}
                    >
                        <Search size={18} />
                        {t('common.loadMore')}
                    </motion.button>
                </motion.div>
            )}
        </motion.div>
    );
}