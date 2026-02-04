'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastProvider';
import { commentService } from '../lib/services/comment.service';
import { CommentResponseDTO } from '../lib/types/api';
import { userService } from '../lib/services/user.service';


interface CommentSectionProps {
    feedbackId: string;
    initialCommentsCount?: number;
    onCommentCountChange?: (count: number) => void;
}

export default function CommentSection({ feedbackId, onCommentCountChange }: CommentSectionProps) {
    const { showToast } = useToast();
    const [comments, setComments] = useState<CommentResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserPseudo, setCurrentUserPseudo] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Editing state
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    // Deleting state
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserAndComments = async () => {
            try {
                // Fetch User
                const user = await userService.getCurrentUser();
                if (user) {
                    setCurrentUserPseudo(`${user.user_firstname} ${user.user_lastname}`);
                    setCurrentUserId(user.user_id);
                }

                // Fetch Comments
                const fetchedComments = await commentService.getCommentsByFeedbackId(feedbackId);
                setComments(fetchedComments);
                if (onCommentCountChange) onCommentCountChange(fetchedComments.length);
            } catch (error) {
                console.error("Error fetching comments:", error);
                showToast("Impossible de charger les commentaires.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndComments();
    }, [feedbackId]);

    const [pseudoInput, setPseudoInput] = useState("");

    useEffect(() => {
        if (currentUserPseudo) {
            setPseudoInput(currentUserPseudo);
        }
    }, [currentUserPseudo]);

    const handleCreateComment = async () => {
        if (!newCommentText.trim()) return;

        // If not logged in, we cannot obtain a commenter_id as required by backend
        if (!currentUserId) {
            showToast("Vous devez être connecté pour commenter.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const newComment = await commentService.createComment({
                feedback_id: feedbackId,
                commenter_id: currentUserId,
                content: newCommentText
            });

            const updatedComments = [...comments, newComment];
            setComments(updatedComments);
            setNewCommentText("");
            if (onCommentCountChange) onCommentCountChange(updatedComments.length);
            showToast("Commentaire ajouté !", "success");
        } catch (error) {
            console.error("Error creating comment:", error);
            showToast("Erreur lors de l'ajout du commentaire.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateComment = async () => {
        if (!editingCommentId || !editContent.trim()) return;

        try {
            const updatedComment = await commentService.updateComment(editingCommentId, { content: editContent });

            const updatedComments = comments.map(c =>
                c.comments_id === editingCommentId ? updatedComment : c
            );

            setComments(updatedComments);
            setEditingCommentId(null);
            setEditContent("");
            showToast("Commentaire modifié !", "success");
        } catch (error) {
            console.error("Error updating comment:", error);
            showToast("Erreur lors de la modification.", "error");
        }
    };

    const handleDeleteComment = async () => {
        if (!deletingCommentId) return;

        try {
            await commentService.deleteComment(deletingCommentId);

            const updatedComments = comments.filter(c => c.comments_id !== deletingCommentId);

            setComments(updatedComments);
            setDeletingCommentId(null);
            if (onCommentCountChange) onCommentCountChange(updatedComments.length);
            showToast("Commentaire supprimé.", "success");
        } catch (error) {
            console.error("Error deleting comment:", error);
            showToast("Erreur lors de la suppression.", "error");
        }
    };

    return (
        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderTop: '1px solid #f3f4f6' }}>
            {/* Input Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {!currentUserPseudo && (
                    <input
                        type="text"
                        value={pseudoInput}
                        onChange={(e) => setPseudoInput(e.target.value)}
                        placeholder="Votre pseudo / Nom"
                        style={{
                            width: '100%', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e5e7eb',
                            fontSize: '0.9rem', outline: 'none', maxWidth: '200px'
                        }}
                    />
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Votre avis sur ce projet..."
                        style={{
                            flex: 1, padding: '12px 20px', borderRadius: '14px', border: '1px solid #e5e7eb',
                            fontSize: '0.9rem', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateComment()}
                    />
                    <button
                        onClick={handleCreateComment}
                        disabled={!newCommentText.trim() || isSubmitting}
                        style={{
                            padding: '0 24px', borderRadius: '14px', border: 'none',
                            backgroundColor: newCommentText.trim() ? '#8a2be2' : '#d1d5db',
                            color: 'white', cursor: 'pointer', fontWeight: '700', transition: '0.2s',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        {isSubmitting ? '...' : 'Envoyer'}
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>Chargement des commentaires...</div>}

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AnimatePresence>
                    {comments.map((comment) => (
                        <motion.div
                            key={comment.comments_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ display: 'flex', gap: '12px' }}
                        >
                            {/* Avatar Placeholder based on Name */}
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)',
                                color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '0.8rem', border: '2px solid #fff',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)', flexShrink: 0
                            }}>
                                {comment.commenter_name ? comment.commenter_name.substring(0, 2).toUpperCase() : '??'}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ backgroundColor: '#fff', borderRadius: '0 16px 16px 16px', padding: '12px 16px', position: 'relative', border: '1px solid #f3f4f6' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#111' }}>
                                            {comment.commenter_name}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                            {new Date(comment.comments_date_time).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {deletingCommentId === comment.comments_id ? (
                                        // Delete Confirmation Mode
                                        <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <p style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: '500', margin: 0 }}>
                                                Voulez-vous vraiment supprimer ce commentaire ?
                                            </p>
                                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                                <button
                                                    onClick={() => setDeletingCommentId(null)}
                                                    style={{
                                                        fontSize: '0.85rem', color: '#6b7280', background: 'none', border: '1px solid #e5e7eb',
                                                        padding: '4px 12px', borderRadius: '6px', cursor: 'pointer'
                                                    }}
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={handleDeleteComment}
                                                    style={{
                                                        fontSize: '0.85rem', color: 'white', background: '#ef4444', border: 'none',
                                                        padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                                                    }}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    ) : editingCommentId === comment.comments_id ? (
                                        // Edit Mode
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '8px', borderColor: '#e5e7eb', fontSize: '0.9rem' }}
                                            />
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => setEditingCommentId(null)} style={{ fontSize: '0.8rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Annuler</button>
                                                <button onClick={handleUpdateComment} style={{ fontSize: '0.8rem', color: '#8a2be2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Enregistrer</button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Display Mode
                                        <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0, lineHeight: 1.5 }}>
                                            {comment.content}
                                        </p>
                                    )}
                                </div>

                                {/* Actions - Hide actions if editing or deleting */}
                                {editingCommentId !== comment.comments_id && deletingCommentId !== comment.comments_id && (
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', marginLeft: '8px', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>
                                        {currentUserPseudo === comment.commenter_name && (
                                            <>
                                                <button
                                                    onClick={() => { setEditingCommentId(comment.comments_id); setEditContent(comment.content); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', transition: '0.2s' }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#4b5563'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => setDeletingCommentId(comment.comments_id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', transition: '0.2s' }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#dc2626'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#ef4444'}
                                                >
                                                    Supprimer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
