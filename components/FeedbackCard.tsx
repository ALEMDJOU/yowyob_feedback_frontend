'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackService } from '../lib/services/feedback.service';
import { useToast } from './ToastProvider';
import ConfirmationModal from './ConfirmationModal';

// Types (Conservés)
export interface Author { name: string; avatar: string; }
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
    project: { name: string; id: string; };
    imageUrl?: string;
    attachments?: string[];
    type?: 'person' | 'business';
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Sous-composant Commentaire Optimisé ---
const CommentItem = ({ comment, onLike }: { comment: Comment; onLike: (id: string) => void }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginTop: '14px', display: 'flex', gap: '12px' }}
    >
        <img
            src={comment.author.avatar || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png'}
            alt={comment.author.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
        />
        <div style={{ flex: 1 }}>
            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '0 16px 16px 16px', padding: '12px', position: 'relative' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111', marginBottom: '4px' }}>
                    {comment.author.name}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0, lineHeight: 1.5 }}>
                    {comment.text}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', marginLeft: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
                <button
                    onClick={() => onLike(comment.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: comment.liked ? '#8a2be2' : '#6b7280', transition: '0.2s' }}
                >
                    {comment.liked ? '❤️ Aimé' : 'J\'aime'} {comment.likes > 0 && `(${comment.likes})`}
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>Répondre</button>
            </div>
        </div>
    </motion.div>
);

// --- Composant Principal ---
export default function FeedbackCard({
    data,
    hideProjectInfo,
    onDelete,
    onUpdate
}: {
    data: FeedbackData,
    hideProjectInfo?: boolean,
    onDelete?: (id: string) => void,
    onUpdate?: (updatedData: FeedbackData) => void
}) {
    const { showToast } = useToast();
    const [feedback, setFeedback] = useState<FeedbackData>(data);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [mainCommentText, setMainCommentText] = useState("");

    // États pour le menu d'actions (Modifier/Supprimer)
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(data.content);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fermer le menu si on clique ailleurs
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleFeedbackLike = () => {
        setFeedback(prev => ({
            ...prev,
            liked: !prev.liked,
            likes: prev.liked ? prev.likes - 1 : prev.likes + 1
        }));
    };

    const handleMainCommentSubmit = () => {
        if (!mainCommentText.trim()) return;
        setFeedback(prev => ({
            ...prev,
            comments: [...prev.comments, {
                id: generateId(),
                author: { name: 'Moi', avatar: 'https://i.ibb.co/Qf983vG/avatar-placeholder.png' },
                text: mainCommentText,
                likes: 0, liked: false, replies: []
            }]
        }));
        setMainCommentText("");
    };

    // Ouverture du modal de suppression
    const handleDeleteClick = () => {
        setShowMenu(false);
        setIsDeleteModalOpen(true);
    };

    // Execution de la suppression après confirmation
    const handleConfirmDelete = async () => {
        setIsDeleteModalOpen(false);
        try {
            await feedbackService.deleteFeedback(feedback.id);
            if (onDelete) {
                onDelete(feedback.id);
            }
            showToast("Feedback supprimé avec succès !", "success");
        } catch (error: any) {
            if (error?.status === 403 || error?.response?.status === 403) {
                showToast("Vous n'êtes pas autorisé à supprimer ce feedback.", "error");
            } else {
                showToast("Une erreur est survenue lors de la suppression.", "error");
            }
        }
    };

    // Gestion de la modification
    const handleUpdate = async () => {
        if (!editContent.trim()) return;
        setIsSaving(true);
        try {
            const response = await feedbackService.updateFeedback(feedback.id, {
                content: editContent,
                attachments: feedback.attachments || [] // On garde les attachments existants pour l'instant
            });

            const updatedData = { ...feedback, content: response.content };
            setFeedback(updatedData);
            setIsEditing(false);
            if (onUpdate) onUpdate(updatedData);

            showToast("Feedback mis à jour avec succès !", "success");
        } catch (error: any) {
            if (error?.status === 403 || error?.response?.status === 403) {
                showToast("Vous n'êtes pas autorisé à modifier ce feedback.", "error");
                setIsEditing(false); // Sortir du mode édition
                setEditContent(feedback.content); // Reset content
            } else {
                showToast("Impossible de mettre à jour le feedback.", "error");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="feedback-card" style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #f0f0f0',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            overflow: 'visible',
            transition: 'transform 0.2s ease',
            position: 'relative'
        }}>
            {/* Modal de Confirmation */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Supprimer le feedback"
                message="Êtes-vous sûr de vouloir supprimer ce feedback ? Cette action est irréversible."
                confirmText="Oui, supprimer"
                cancelText="Annuler"
                isDangerous={true}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />

            {/* Header */}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src={feedback.author.avatar}
                            alt={feedback.author.name}
                            style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #8a2be2' }}
                        />
                        {feedback.type === 'business' && (
                            <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#8a2be2', color: 'white', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                <i className="fas fa-briefcase"></i>
                            </div>
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#111' }}>{feedback.author.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="far fa-clock"></i>
                            {new Date(feedback.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                            {!hideProjectInfo && (
                                <>
                                    <span>•</span>
                                    <Link href={`/dashboard/project/${feedback.project.id}`} style={{ color: '#8a2be2', textDecoration: 'none', fontWeight: '700' }}>
                                        #{feedback.project.name}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Menu 3 points */}
                <div style={{ position: 'relative' }} ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        style={{
                            background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
                            padding: '8px', borderRadius: '50%', transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <i className="fas fa-ellipsis-v"></i>
                    </button>

                    {showMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            width: '150px',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: '1px solid #e5e7eb',
                            zIndex: 50,
                            overflow: 'hidden',
                            padding: '4px'
                        }}>
                            <button
                                onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    width: '100%', padding: '10px 12px',
                                    background: 'white', border: 'none',
                                    textAlign: 'left', cursor: 'pointer',
                                    fontSize: '0.9rem', color: '#374151',
                                    borderRadius: '8px'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <i className="fas fa-edit" style={{ color: '#6b7280' }}></i> Modifier
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    width: '100%', padding: '10px 12px',
                                    background: 'white', border: 'none',
                                    textAlign: 'left', cursor: 'pointer',
                                    fontSize: '0.9rem', color: '#ef4444',
                                    borderRadius: '8px'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <i className="fas fa-trash-alt"></i> Supprimer
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenu Texte */}
            <div style={{ padding: '0 20px 16px 20px', fontSize: '1rem', color: '#374151', lineHeight: '1.6' }}>
                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '12px',
                                border: '1px solid #d1d5db', minHeight: '100px',
                                fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical'
                            }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsEditing(false)}
                                style={{
                                    padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db',
                                    background: 'white', color: '#374151', cursor: 'pointer', fontWeight: '600'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={isSaving}
                                style={{
                                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                                    background: '#8a2be2', color: 'white', cursor: 'pointer', fontWeight: '600',
                                    opacity: isSaving ? 0.7 : 1
                                }}
                            >
                                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                ) : (
                    feedback.content
                )}
            </div>

            {/* Images/Attachments Optimisées */}
            {(feedback.imageUrl || (feedback.attachments && feedback.attachments.length > 0)) && (
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {feedback.imageUrl && (
                        <div style={{
                            width: '100%',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            background: '#f8f9fa',
                            border: '1px solid #f0f0f0'
                        }}>
                            <img
                                src={feedback.imageUrl}
                                alt="Media"
                                style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }}
                            />
                        </div>
                    )}
                    {feedback.attachments && feedback.attachments.length > 0 && feedback.attachments.map((url, index) => (
                        url !== feedback.imageUrl && (
                            <div key={index} style={{
                                width: '100%',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                background: '#f8f9fa',
                                border: '1px solid #f0f0f0'
                            }}>
                                <img
                                    src={url}
                                    alt={`Attachment ${index + 1}`}
                                    style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }}
                                />
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* Stats */}
            <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f9fafb', borderBottom: '1px solid #f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8a2be2', fontSize: '0.85rem', fontWeight: '700' }}>
                    <div style={{ background: '#f3e8ff', padding: '4px 8px', borderRadius: '20px' }}>
                        <i className="fas fa-heart" style={{ marginRight: '5px' }}></i>
                        {feedback.likes}
                    </div>
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '500' }}>
                    {feedback.comments.length} commentaires
                </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '8px 20px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleFeedbackLike}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: feedback.liked ? '#f3e8ff' : 'transparent',
                        color: feedback.liked ? '#8a2be2' : '#4b5563',
                        fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <i className={feedback.liked ? "fas fa-heart" : "far fa-heart"}></i>
                    <span>{feedback.liked ? 'Aimé' : 'J\'aime'}</span>
                </button>
                <button
                    onClick={() => setShowCommentBox(!showCommentBox)}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: 'transparent', color: '#4b5563',
                        fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <i className="far fa-comment-dots"></i>
                    <span>Commenter</span>
                </button>
            </div>

            {/* Zone de Commentaire avec Animation */}
            <AnimatePresence>
                {showCommentBox && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ backgroundColor: '#f9fafb', padding: '20px', borderTop: '1px solid #f3f4f6' }}
                    >
                        <div style={{ display: 'flex', gap: '12px', marginBottom: feedback.comments.length > 0 ? '20px' : '0' }}>
                            <input
                                type="text"
                                value={mainCommentText}
                                onChange={(e) => setMainCommentText(e.target.value)}
                                placeholder="Votre avis sur ce projet..."
                                style={{
                                    flex: 1, padding: '12px 20px', borderRadius: '14px', border: '1px solid #e5e7eb',
                                    fontSize: '0.9rem', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleMainCommentSubmit()}
                            />
                            <button
                                onClick={handleMainCommentSubmit}
                                disabled={!mainCommentText.trim()}
                                style={{
                                    padding: '0 24px', borderRadius: '14px', border: 'none',
                                    backgroundColor: mainCommentText.trim() ? '#8a2be2' : '#d1d5db',
                                    color: 'white', cursor: 'pointer', fontWeight: '700', transition: '0.2s'
                                }}
                            >
                                Envoyer
                            </button>
                        </div>

                        {/* Liste des commentaires */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {feedback.comments.map(comment => (
                                <CommentItem key={comment.id} comment={comment} onLike={() => { }} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}