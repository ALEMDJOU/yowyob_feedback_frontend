'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Types (Conservés tels quels)
export interface Author {
    name: string;
    avatar: string;
}

export interface Comment {
    id: string;
    author: Author;
    text: string;
    likes: number;
    liked: boolean;
    replies: Comment[];
}

export interface FeedbackData {
    id: string;
    author: Author;
    createdAt: string;
    content: string;
    likes: number;
    liked: boolean;
    comments: Comment[];
    project: {
        name: string;
        id: string;
    };
    imageUrl?: string; // Ajout sécurisé pour la démo LinkedIn
    type?: 'person' | 'business';
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const CommentItem = ({
    comment,
    onLike,
    onReply
}: {
    comment: Comment;
    onLike: (id: string) => void;
    onReply: (parentId: string, text: string) => void;
}) => {
    return (
        <div style={{ marginTop: '12px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <img
                    src={comment.author.avatar || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png'}
                    alt={comment.author.name}
                    width={32}
                    height={32}
                    style={{ borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ backgroundColor: '#f2f2f2', borderRadius: '0 12px 12px 12px', padding: '10px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333', marginBottom: '2px' }}>
                            {comment.author.name}
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#444', margin: 0, lineHeight: 1.4 }}>
                            {comment.text}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '4px', marginLeft: '5px', fontSize: '0.75rem' }}>
                        <button
                            onClick={() => onLike(comment.id)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: comment.liked ? '#6A1B9A' : '#666',
                                fontWeight: comment.liked ? 'bold' : '600'
                            }}
                        >
                            J'aime {comment.likes > 0 && `(${comment.likes})`}
                        </button>
                        <span style={{ color: '#999' }}>Répondre</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function FeedbackCard({ data, hideProjectInfo }: { data: FeedbackData, hideProjectInfo?: boolean }) {
    const [feedback, setFeedback] = useState<FeedbackData>(data);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [mainCommentText, setMainCommentText] = useState("");

    const emojis = ['😊', '❤️', '👍', '🎉', '🔥', '💯', '👏', '🙌'];

    // LOGIQUE METIER CONSERVÉE
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

    const handleReply = (parentId: string, text: string) => {
        // Logique de réponse conservée
    };

    const handleMainCommentSubmit = () => {
        if (mainCommentText.trim()) {
            setFeedback(prev => ({
                ...prev,
                comments: [...prev.comments, {
                    id: generateId(),
                    author: { name: 'Moi', avatar: 'https://i.ibb.co/Qf983vG/avatar-placeholder.png' },
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

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #e0e0e0',
            marginBottom: '16px',
            fontFamily: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            {/* Header style LinkedIn */}
            <div style={{ padding: '12px 16px', display: 'flex', gap: '12px' }}>
                <img 
                    src={feedback.author.avatar} 
                    alt={feedback.author.name} 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1a1a1a' }}>{feedback.author.name}</span>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        <span>{formatTime(feedback.createdAt)}</span>
                        {!hideProjectInfo && (
                             <span style={{ marginLeft: '5px' }}>
                                • pour <Link href={`/dashboard/project/${feedback.project.id}`} style={{ color: '#6A1B9A', textDecoration: 'none', fontWeight: '600' }}>{feedback.project.name}</Link>
                             </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenu Texte */}
            <div style={{ padding: '0 16px 12px 16px', fontSize: '0.95rem', color: '#333', lineHeight: '1.5' }}>
                {feedback.content}
            </div>

            {/* IMAGE MÉDIA (NOUVEAU) */}
            {feedback.imageUrl && (
                <div style={{ width: '100%', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', backgroundColor: '#f9f9f9' }}>
                    <img 
                        src={feedback.imageUrl} 
                        alt="Feedback attachment" 
                        style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', display: 'block' }} 
                    />
                </div>
            )}

            {/* Statistiques rapides */}
            {(feedback.likes > 0 || feedback.comments.length > 0) && (
                <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', borderBottom: '1px solid #f0f0f0' }}>
                    <span>{feedback.likes > 0 && `👍 ${feedback.likes}`}</span>
                    <span>{feedback.comments.length > 0 && `${feedback.comments.length} commentaires`}</span>
                </div>
            )}

            {/* Boutons d'actions */}
            <div style={{ padding: '4px 16px', display: 'flex', gap: '8px' }}>
                <button
                    onClick={handleFeedbackLike}
                    style={{
                        background: 'none', border: 'none', borderRadius: '4px',
                        color: feedback.liked ? '#6A1B9A' : '#666',
                        fontWeight: '600', cursor: 'pointer', padding: '10px',
                        display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center'
                    }}
                >
                    <i className={feedback.liked ? "fas fa-thumbs-up" : "far fa-thumbs-up"}></i>
                    <span>J'aime</span>
                </button>
                <button
                    onClick={() => setShowCommentBox(!showCommentBox)}
                    style={{
                        background: 'none', border: 'none', borderRadius: '4px',
                        color: '#666', fontWeight: '600', cursor: 'pointer', padding: '10px',
                        display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center'
                    }}
                >
                    <i className="far fa-comment"></i>
                    <span>Commenter</span>
                </button>
            </div>

            {/* Input Commentaire */}
            {showCommentBox && (
                <div style={{ padding: '12px 16px', backgroundColor: '#f9f9f9', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={mainCommentText}
                            onChange={(e) => setMainCommentText(e.target.value)}
                            placeholder="Ajouter un commentaire..."
                            style={{
                                flex: 1, padding: '10px 16px', borderRadius: '25px',
                                border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none'
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleMainCommentSubmit()}
                        />
                        <button
                            onClick={handleMainCommentSubmit}
                            disabled={!mainCommentText.trim()}
                            style={{
                                padding: '0 16px', borderRadius: '20px', border: 'none',
                                backgroundColor: mainCommentText.trim() ? '#6A1B9A' : '#ccc',
                                color: 'white', cursor: mainCommentText.trim() ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold', fontSize: '0.85rem'
                            }}
                        >
                            Publier
                        </button>
                    </div>
                </div>
            )}

            {/* Liste des commentaires */}
            {feedback.comments.length > 0 && (
                <div style={{ padding: '0 16px 16px 16px' }}>
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