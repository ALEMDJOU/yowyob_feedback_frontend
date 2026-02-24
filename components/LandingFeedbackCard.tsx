'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FeedbackData } from './FeedbackCard';

/**
 * Premium Dark glassmorphism card for landing page and user profile feedbacks.
 * Palette: Violet, Grey, White.
 * Features: Uniform height, "Voir plus" for long content, interaction-free otherwise.
 */
export default function LandingFeedbackCard({ data }: { data: FeedbackData }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const contentRef = useRef<HTMLParagraphElement>(null);

    const projectName = data.project?.name || '';
    const projectLogo = data.author?.avatar || '';
    const content = data.content || '';

    const dateStr = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : '';

    // Check if content is long enough to be truncated
    useEffect(() => {
        if (contentRef.current) {
            const el = contentRef.current;
            // If scrollHeight > offsetHeight, it means content is clipped
            setIsTruncated(el.scrollHeight > el.offsetHeight);
        }
    }, [content]);

    return (
        <article style={{
            background: 'linear-gradient(145deg, #1e1b2e 0%, #15141b 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '24px',
            padding: '28px',
            color: '#FFFFFF',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden',
            // Ensure uniform height while allowing expansion
            minHeight: '380px',
            height: isExpanded ? 'auto' : '380px',
            display: 'flex',
            flexDirection: 'column',
        }}
            className="premium-feedback-card"
        >
            {/* Subtle violet glow orb */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '140px',
                height: '140px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
            }} />

            {/* ─── Header: Project Info ─── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', flexShrink: 0 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                        src="/images/logo.jpg"
                        alt={projectName}
                        style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '2px solid #8B5CF6',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        }}
                    />
                </div>

                <div style={{ minWidth: 0 }}>
                    <h4 style={{
                        margin: 0,
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: '#FFFFFF',
                        letterSpacing: '0.4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '2px',
                    }}>
                        {projectName || 'Projet'}
                    </h4>
                    {dateStr && (
                        <p style={{
                            margin: 0,
                            fontSize: '0.75rem',
                            color: '#9CA3AF',
                            fontWeight: 500,
                        }}>
                            {dateStr}
                        </p>
                    )}
                </div>
            </div>

            {/* ─── Divider ─── */}
            <div style={{
                height: '1px',
                background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.2), transparent)',
                marginBottom: '20px',
                flexShrink: 0,
            }} />

            {/* ─── Content ─── */}
            <div style={{
                position: 'relative',
                flexGrow: 1,
                marginBottom: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <i className="fas fa-quote-left" style={{
                    position: 'absolute',
                    top: '-5px',
                    left: '-10px',
                    fontSize: '2rem',
                    color: 'rgba(139, 92, 246, 0.07)',
                    pointerEvents: 'none',
                }} />
                <p
                    ref={contentRef}
                    style={{
                        margin: 0,
                        fontSize: '0.98rem',
                        lineHeight: 1.7,
                        color: '#D1D5DB',
                        fontWeight: 400,
                        display: isExpanded ? 'block' : '-webkit-box',
                        WebkitLineClamp: 7,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 1,
                        letterSpacing: '0.1px',
                        fontStyle: 'italic',
                    }}
                >
                    {content}
                </p>

                {(isTruncated || isExpanded) && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#8B5CF6',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: '8px 0',
                            textAlign: 'left',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '4px',
                            alignSelf: 'flex-start',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                        onMouseLeave={e => e.currentTarget.style.color = '#8B5CF6'}
                    >
                        {isExpanded ? (
                            <>Voir moins <i className="fas fa-chevron-up" style={{ fontSize: '0.7rem' }} /></>
                        ) : (
                            <>Voir plus <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem' }} /></>
                        )}
                    </button>
                )}
            </div>

            {/* ─── Footer: Author ─── */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '16px',
                borderTop: '1px solid rgba(156, 163, 175, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                {data.author?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(139, 92, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem'
                        }}>
                            <i className="fas fa-user" style={{ color: '#8B5CF6' }} />
                        </div>
                        <span style={{
                            fontSize: '0.82rem',
                            color: '#FFFFFF',
                            fontWeight: 600,
                        }}>
                            {data.author.name}
                        </span>
                    </div>
                )}

                <div style={{
                    fontSize: '0.7rem',
                    color: '#8B5CF6',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    opacity: 0.8
                }}>
                    Feedback
                </div>
            </div>

            <style jsx>{`
                .premium-feedback-card:hover {
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                    border-color: rgba(139, 92, 246, 0.5);
                }
            `}</style>
        </article>
    );
}
