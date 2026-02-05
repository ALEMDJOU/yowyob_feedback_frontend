"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/components/I18nProvider';
import { subscriptionService } from '@/lib/services/subscription.service';
import { PersonDTO, SubscriptionStatsDTO } from '@/lib/types/api';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

type TabType = 'followers' | 'following';

export default function FollowPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('following');
    const [stats, setStats] = useState<SubscriptionStatsDTO | null>(null);
    const [users, setUsers] = useState<PersonDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Fetch stats
    useEffect(() => {
        loadStats();
    }, []);

    // Fetch users when tab changes
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

            // Check if there are more pages
            setHasMore(response.number + 1 < response.totalPages);
        } catch (error) {
            console.error("Failed to load users", error);
            toast.error(t('common.errorLoadingUsers') || "Erreur lors du chargement des utilisateurs");
        } finally {
            setLoading(false);
        }
    };

    const handleUnsubscribe = async (userId: string) => {
        try {
            await subscriptionService.unsubscribe(userId);
            toast.success(t('common.unsubscribed') || "Désabonné avec succès");

            // Refresh local state without full reload
            setUsers(prev => prev.filter(u => u.userId !== userId));
            loadStats(); // Refresh counters
        } catch (error) {
            toast.error(t('common.errorUnsubscribing') || "Erreur lors du désabonnement");
        }
    };

    const handleSubscribe = async (userId: string) => {
        try {
            await subscriptionService.subscribe(userId);
            toast.success(t('common.subscribed') || "Abonné avec succès");
            loadStats();
        } catch (error) {
            toast.error(t('common.errorSubscribing') || "Erreur lors de l'abonnement");
        }
    };

    return (
        <>
            <div className="content-header">
                <div className="header-title">
                    <i className="fas fa-users title-icon"></i>
                    <h1>{t('follow.title') || 'Mon Réseau'}</h1>
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-container" style={{ display: 'flex', gap: '20px', padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', marginBottom: '20px' }}>
                <div className="stat-item" style={{ flex: 1, textAlign: 'center' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats?.followersCount || 0}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('follow.followers') || 'Abonnés'}</p>
                </div>
                <div className="stat-item" style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats?.followingCount || 0}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('follow.following') || 'Abonnements'}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <button
                    className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
                    onClick={() => setActiveTab('following')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'following' ? '2px solid var(--primary-color)' : 'none',
                        color: activeTab === 'following' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'following' ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                >
                    {t('follow.following') || 'Abonnements'}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('followers')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'followers' ? '2px solid var(--primary-color)' : 'none',
                        color: activeTab === 'followers' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'followers' ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                >
                    {t('follow.followers') || 'Abonnés'}
                </button>
            </div>

            {/* User List */}
            <div className="user-list">
                {users.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <i className="fas fa-user-slash" style={{ fontSize: '48px', marginBottom: '10px' }}></i>
                        <p>{t('follow.empty') || 'Aucun utilisateur trouvé'}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {users.map(user => (
                            <div key={user.userId} className="user-card" style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '15px',
                                background: 'var(--card-bg)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)'
                            }}>
                                <Image
                                    src={user.profileImage || "/default-avatar.png"}
                                    alt={user.firstName}
                                    width={50}
                                    height={50}
                                    style={{ borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '16px' }}>{user.firstName} {user.lastName}</h4>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>@{user.email?.split('@')[0] || 'user'}</p>
                                    {user.occupation && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--primary-color)' }}>{user.occupation}</p>}
                                </div>
                                {activeTab === 'following' && (
                                    <button
                                        onClick={() => handleUnsubscribe(user.userId)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: '1px solid var(--danger-color, #e74c3c)',
                                            background: 'transparent',
                                            color: 'var(--danger-color, #e74c3c)',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {t('follow.unsubscribe') || 'Se désabonner'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Chargement...</div>}

                {!loading && hasMore && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button
                            onClick={() => {
                                const nextPage = page + 1;
                                setPage(nextPage);
                                loadUsers(nextPage, activeTab);
                            }}
                            style={{
                                padding: '10px 20px',
                                background: 'var(--secondary-bg)',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {t('common.loadMore') || 'Voir plus'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
