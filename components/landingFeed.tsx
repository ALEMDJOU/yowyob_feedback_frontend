'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from './I18nProvider';
import { landingfeedService } from '../lib/services/landingfeed.service';
import LandingFeedbackCard from './LandingFeedbackCard';
import { FeedbackData } from './FeedbackCard';

// Split an array into chunks of n
function chunk<T>(arr: T[], n: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n));
    return result;
}

const INTERVAL_MS = 4500;

const LandingFeed = () => {
    const { t } = useTranslation();
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);   // current group index
    const [visible, setVisible] = useState(true); // animation toggle

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const data = await landingfeedService.getAllFeedbacks();

                const mapped: FeedbackData[] = data.map(fb => ({
                    id: fb.feedback_id,
                    content: fb.content,
                    createdAt: fb.feedback_date_time,
                    likes: fb.number_of_likes,
                    liked: false,
                    comments: [],
                    attachments: fb.attachments,
                    project: { id: fb.target_project_id, name: fb.project_name },
                    author: { name: fb.member_pseudo, avatar: fb.project_logo || '' },
                    type: 'person',
                }));

                const sorted = mapped.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setFeedbacks(sorted);
            } catch (error) {
                console.error('Failed to fetch landing feedbacks:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);

    // Auto-advance groups
    const groups = chunk(feedbacks, 3);
    const totalGroups = groups.length;

    const advance = useCallback(() => {
        // Fade-out → swap → fade-in
        setVisible(false);
        setTimeout(() => {
            setCurrent(prev => (prev + 1) % totalGroups);
            setVisible(true);
        }, 500);
    }, [totalGroups]);

    useEffect(() => {
        if (totalGroups <= 1) return;
        const timer = setInterval(advance, INTERVAL_MS);
        return () => clearInterval(timer);
    }, [advance, totalGroups]);

    if (loading) {
        return (
            <section style={{ padding: '80px 0', background: '#080614', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-block', width: '44px', height: '44px',
                    border: '4px solid rgba(142, 36, 170, 0.15)',
                    borderTopColor: '#8E24AA', borderRadius: '50%',
                    animation: 'spin 0.9s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </section>
        );
    }

    if (feedbacks.length === 0) return null;

    const currentGroup = groups[current] || [];

    return (
        <section
            id="landing-feed"
            style={{
                background: 'linear-gradient(180deg, #080614 0%, #0d0924 100%)',
                padding: '90px 0',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Ambient glow blobs */}
            <div style={{
                position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(106,27,154,0.12) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '5%', width: '350px', height: '350px',
                background: 'radial-gradient(circle, rgba(142,36,170,0.10) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* ─── Header ─── */}
                <div style={{ textAlign: 'center', marginBottom: '55px' }}>
                    <span style={{
                        display: 'inline-block',
                        background: 'rgba(142,36,170,0.15)',
                        border: '1px solid rgba(142,36,170,0.35)',
                        color: '#c084fc', borderRadius: '30px',
                        padding: '6px 18px', fontSize: '0.8rem',
                        fontWeight: 700, letterSpacing: '1.5px',
                        textTransform: 'uppercase', marginBottom: '20px',
                    }}>
                        Communauté
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                        fontWeight: 800, color: '#ffffff',
                        marginBottom: '14px', letterSpacing: '-0.5px',
                    }}>
                        {t('landing.latestFeedbacks')}
                    </h2>
                    <p style={{
                        color: 'rgba(200,180,230,0.65)',
                        fontSize: '1.05rem', maxWidth: '580px',
                        margin: '0 auto', lineHeight: 1.7,
                    }}>
                        {t('landing.latestFeedbacksDesc')}
                    </p>
                </div>

                {/* ─── Cards Group (slides as a unit via opacity + translateY) ─── */}
                <div
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(18px)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease',
                    }}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '24px',
                    }}
                        className="lf-grid"
                    >
                        {currentGroup.map((fb, idx) => (
                            <div key={fb.id + '-' + idx}>
                                <LandingFeedbackCard data={fb} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── Dot indicators ─── */}
                {totalGroups > 1 && (
                    <div style={{
                        display: 'flex', justifyContent: 'center',
                        gap: '10px', marginTop: '44px',
                    }}>
                        {groups.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setVisible(false);
                                    setTimeout(() => { setCurrent(i); setVisible(true); }, 500);
                                }}
                                aria-label={`Groupe ${i + 1}`}
                                style={{
                                    width: i === current ? '28px' : '10px',
                                    height: '10px',
                                    borderRadius: '5px',
                                    background: i === current
                                        ? '#8E24AA'
                                        : 'rgba(142,36,170,0.3)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s ease',
                                    padding: 0,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Responsive styles ─── */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 900px) {
                    .lf-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 560px) {
                    .lf-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
};

export default LandingFeed;
