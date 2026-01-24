'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Types
export interface Comment {
    id: string;
    author: string;
    text: string;
    avatar?: string;
    likes: number;
    liked: boolean;
    replies: Comment[];
}

export interface FeedbackData {
    id: string;
    author: string;
    authorAvatar: string;
    time: string;
    content: string;
    likes: number;
    liked: boolean;
    comments: Comment[];
    type?: 'person' | 'business';
}

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Recursive Comment Component
const CommentItem = ({
    comment,
    onLike,
    onReply
}: {
    comment: Comment;
    onLike: (id: string) => void;
    onReply: (parentId: string, text: string) => void;
}) => {
    // Reply state removed as functionality is disabled

    return (
        <div style={{ marginTop: '12px', position: 'relative' }}>
            {/* Thread line for nested comments */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <img
                    src={comment.avatar || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png'}
                    alt={comment.author}
                    width={32}
                    height={32}
                    style={{ borderRadius: '50%', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ backgroundColor: '#f5f5f5', borderRadius: '12px', padding: '10px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                            {comment.author}
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#444', margin: 0, lineHeight: 1.4 }}>
                            {comment.text}
                        </p>
                    </div>

                    {/* Actions: Like only */}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '4px', marginLeft: '10px', fontSize: '0.8rem' }}>
                        <button
                            onClick={() => onLike(comment.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: comment.liked ? '#6A1B9A' : '#666',
                                fontWeight: comment.liked ? 'bold' : 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <i className="fas fa-thumbs-up"></i>
                            {comment.likes > 0 && <span> ({comment.likes})</span>}
                        </button>
                        <span style={{ color: '#999' }}>· 2h</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default function FeedbackCard({ data }: { data: FeedbackData }) {
    const [feedback, setFeedback] = useState<FeedbackData>(data);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [mainCommentText, setMainCommentText] = useState("");

    const emojis = ['😊', '❤️', '👍', '🎉', '🔥', '💯', '👏', '🙌'];

    const handleFeedbackLike = () => {
        setFeedback(prev => ({
            ...prev,
            liked: !prev.liked,
            likes: prev.liked ? prev.likes - 1 : prev.likes + 1
        }));
    };

    const findCommentAndAction = (comments: Comment[], targetId: string, action: (c: Comment) => Comment): Comment[] => {
        return comments.map(c => {
            if (c.id === targetId) return action(c);
            if (c.replies.length > 0) return { ...c, replies: findCommentAndAction(c.replies, targetId, action) };
            return c;
        });
    };

    const handleCommentLike = (commentId: string) => {
        setFeedback(prev => ({
            ...prev,
            comments: findCommentAndAction(prev.comments, commentId, (c) => ({
                ...c,
                liked: !c.liked,
                likes: c.liked ? c.likes - 1 : c.likes + 1
            }))
        }));
    };

    const addReplyToComment = (comments: Comment[], targetId: string, replyText: string): Comment[] => {
        return comments.map(c => {
            if (c.id === targetId) {
                return {
                    ...c,
                    replies: [...c.replies, {
                        id: generateId(),
                        author: 'Moi', // Default current user
                        text: replyText,
                        likes: 0,
                        liked: false,
                        replies: []
                    }]
                };
            }
            if (c.replies.length > 0) {
                return { ...c, replies: addReplyToComment(c.replies, targetId, replyText) };
            }
            return c;
        });
    };

    const handleReply = (parentId: string, text: string) => {
        setFeedback(prev => ({
            ...prev,
            comments: addReplyToComment(prev.comments, parentId, text)
        }));
    };

    const handleMainCommentSubmit = () => {
        if (mainCommentText.trim()) {
            setFeedback(prev => ({
                ...prev,
                comments: [...prev.comments, {
                    id: generateId(),
                    author: 'Moi',
                    text: mainCommentText,
                    likes: 0,
                    liked: false,
                    replies: []
                }]
            }));
            setMainCommentText("");
            setShowCommentBox(false);
        }
    };

    const addEmoji = (emoji: string) => setMainCommentText(prev => prev + emoji);

    return (
        <div className="feedback-card">
            <div className="feedback-header">
                <img src={feedback.authorAvatar} alt={feedback.author} width={45} height={45} className="feedback-avatar" />
                <div className="feedback-meta">
                    <span className="feedback-author">{feedback.author}</span>
                    <span className="feedback-time"><i className="fas fa-clock"></i> {feedback.time}</span>
                </div>
            </div>
            <div className="feedback-content">
                <p>{feedback.content}</p>
            </div>
            <div className="feedback-actions">
                <button
                    onClick={handleFeedbackLike}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: feedback.liked ? '#6A1B9A' : '#666',
                        fontWeight: feedback.liked ? 'bold' : 'normal',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        marginRight: '10px',
                        transition: 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (!feedback.liked) e.currentTarget.style.color = '#666';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = feedback.liked ? '#6A1B9A' : '#666';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <i className="fas fa-thumbs-up"></i> ({feedback.likes})
                </button>
                <button
                    onClick={() => setShowCommentBox(!showCommentBox)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        marginRight: '10px',
                        transition: 'none'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#666';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#666';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <i className="fas fa-comment"></i> Commenter
                </button>
            </div>

            {/* Main Comment Input */}
            {showCommentBox && (
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        {emojis.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => addEmoji(emoji)}
                                style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={mainCommentText}
                            onChange={(e) => setMainCommentText(e.target.value)}
                            placeholder="Écrire un commentaire..."
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '20px',
                                border: '1px solid #ddd',
                                fontSize: '0.95rem'
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleMainCommentSubmit()}
                        />
                        <button
                            onClick={handleMainCommentSubmit}
                            disabled={!mainCommentText.trim()}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '20px',
                                border: 'none',
                                backgroundColor: mainCommentText.trim() ? '#6A1B9A' : '#ccc',
                                color: 'white',
                                cursor: mainCommentText.trim() ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold'
                            }}
                        >
                            Envoyer
                        </button>
                    </div>
                </div>
            )}

            {/* Comments List */}
            {feedback.comments.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    {feedback.comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onLike={handleCommentLike}
                            onReply={handleReply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
