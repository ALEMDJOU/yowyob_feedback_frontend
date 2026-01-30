"use client";

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useTranslation } from '@/components/I18nProvider';
import FeedbackCard, { FeedbackData } from '@/components/FeedbackCard';
import { feedService, AggregatedFeed } from '@/lib/services/feedService';

export default function FeedPage() {
    const { t } = useTranslation();
    const [feedData, setFeedData] = useState<AggregatedFeed>({ feedbacks: [], users: [] });
    const [loading, setLoading] = useState(true);
    const [isHeaderInfoOpen, setIsHeaderInfoOpen] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchFeedData = async () => {
            setLoading(true);
            try {
                const data = await feedService.getGlobalFeed();
                setFeedData(data);
            } catch (err) {
                console.error("Failed to load feed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedData();
    }, []);

    // Transformation pour le composant FeedbackCard
    const feedbacks = feedData.feedbacks.map((fb): FeedbackData => ({
        id: fb.feedback_id,
        author: {
            name: fb.member_pseudo || fb.author?.user_lastname || 'Membre',
            avatar: fb.author?.user_logo || `https://i.pravatar.cc/150?u=${fb.member_id}`
        },
        createdAt: fb.feedback_date_time,
        content: fb.content,
        likes: fb.number_of_likes,
        liked: false,
        project: { name: fb.project_name, id: fb.target_project_id },
        comments: []
    }));

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <link rel="stylesheet" href="/feed.css" />

            {/* Circular Global Header (Style de la page jointe) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', position: 'relative' }} ref={headerRef}>
                <div style={{ position: 'relative' }}>
                    <div
                        style={{
                            background: 'white', border: '2px solid #7C3AED', borderRadius: '50%', padding: '5px',
                            boxShadow: '0 8px 16px rgba(124, 58, 237, 0.15)',
                            width: '128px', height: '128px', overflow: 'hidden', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1
                        }}
                    >
                        <i className="fas fa-globe-americas" style={{ fontSize: '4rem', color: '#7C3AED' }}></i>
                    </div>
                    <div style={{
                        position: 'absolute', top: '-5px', left: '-5px', right: '-5px', bottom: '-5px',
                        border: '2px solid rgba(124, 58, 237, 0.3)', borderRadius: '50%',
                        animation: 'pulse 2s infinite', zIndex: 0
                    }}></div>
                </div>
                <h1 style={{ marginTop: '15px', fontSize: '1.75rem', fontWeight: 800, color: '#1F2937' }}>{t('feed.title')}</h1>
                <p style={{ color: '#6B7280', marginTop: '5px' }}>Explorez les dernières activités de votre réseau</p>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    70% { transform: scale(1.1); opacity: 0; }
                    100% { transform: scale(1.1); opacity: 0; }
                }
            `}</style>

            {/* --- SECTION FEEDBACKS EN PREMIER --- */}
            <section className="feedback-section" style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '20px', fontWeight: 700, fontSize: '1.25rem' }}>{t('feed.recentFeedback')}</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>
                ) : feedbacks.length > 0 ? (
                    feedbacks.map(data => (
                        <FeedbackCard key={data.id} data={data} />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#F9FAFB', borderRadius: '16px', color: '#9CA3AF' }}>
                        Aucun feedback récent.
                    </div>
                )}
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '40px 0' }} />

            {/* --- SECTION MEMBRES / ENTREPRISES (Dynamique) --- */}
            <section className="featured-members-section">
                <h3 style={{ marginBottom: '20px', fontWeight: 700, fontSize: '1.25rem' }}>{t('feed.featuredTitle')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>

                    {feedData.users.slice(0, 6).map(user => (
                        <div key={user.user_id} style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
                            <img
                                src={user.user_logo || "https://i.ibb.co/Qf983vG/avatar-placeholder.png"}
                                alt={`${user.user_firstname} ${user.user_lastname}`}
                                style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '15px', border: '3px solid #F3F4F6', objectFit: 'cover' }}
                            />
                            <h4 style={{ margin: '0 0 10px 0', color: '#1F2937' }}>
                                {user.user_firstname} {user.user_lastname}
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '15px' }}>{user.occupation || user.domain || 'Membre'}</p>
                            <button style={{
                                background: '#7C3AED', color: 'white', border: 'none', width: '100%',
                                borderRadius: '10px', padding: '10px', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}>
                                <i className="fas fa-rss"></i> {t('feed.subscribe')}
                            </button>
                        </div>
                    ))}

                    {feedData.users.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>
                            Aucun membre à afficher.
                        </div>
                    )}

                </div>
            </section>

            <Script src="/feed.js" strategy="lazyOnload" />
        </div>
    );
}