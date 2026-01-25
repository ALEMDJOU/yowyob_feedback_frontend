"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { passwordResetService } from '@/lib/services';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Variantes pour l'apparition en cascade (Staggered)
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await passwordResetService.requestPasswordReset({ email });
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de l\'envoi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <AnimatePresence mode="wait">
                {!isSubmitted ? (
                    <motion.div 
                        key="form-view"
                        className="auth-card"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '15px' }}>
                            <Image src="/images/logo.jpg" alt="Logo" width={60} height={60} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                        </motion.div>

                        <motion.h2 variants={itemVariants} style={{ textAlign: 'center', marginBottom: '10px', color: '#6A1B9A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M12 1a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V6h2v6z" fill="#6A1B9A"/>
                            </svg>
                            Mot de passe oublié
                        </motion.h2>
                        
                        <motion.p variants={itemVariants} style={{ textAlign: 'center', color: '#666', fontSize: '0.9em', marginBottom: '20px' }}>
                            Entrez votre email pour recevoir un lien de récupération.
                        </motion.p>
                        
                        {error && (
                            <motion.div 
                                initial={{ x: -10 }}
                                animate={{ x: [-10, 10, -10, 10, 0] }} // Animation de secousse (Shake)
                                style={{ color: 'red', backgroundColor: '#FEE', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9em' }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleRequestReset}>
                            <motion.div variants={itemVariants} className="auth-form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="auth-form-control"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </motion.div>

                            <motion.button 
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                className="btn btn-primary" 
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    backgroundColor: '#6A1B9A', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 15px rgba(106, 27, 154, 0.2)'
                                }} 
                                disabled={loading}
                            >
                                {loading ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}>
                                            <circle cx="12" cy="12" r="10" stroke="#6A1B9A" strokeWidth="4" opacity="0.3"/>
                                            <path d="M22 12a10 10 0 00-10-10" stroke="#6A1B9A" strokeWidth="4"/>
                                        </svg>
                                        Envoi en cours...
                                    </span>
                                ) : (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M22 2L11 13" stroke="#6A1B9A" strokeWidth="2"/>
                                            <path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="#6A1B9A" strokeWidth="2" fill="none"/>
                                        </svg>
                                        Envoyer le lien
                                    </span>
                                )}
                            </motion.button>
                        </form>

                        <motion.div variants={itemVariants} style={{ marginTop: '20px', textAlign: 'center' }}>
                            <Link href="/auth/login" style={{ color: '#6A1B9A', fontWeight: '600', textDecoration: 'none', fontSize: '0.9em' }}>
                                 ← Retour à la connexion
                            </Link>
                        </motion.div>
                    </motion.div>
                ) : (
                    /* VUE SUCCÈS ANIMÉE */
                    <motion.div 
                        key="success-view"
                        className="auth-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            style={{ marginBottom: '20px' }}
                        >
                            <svg width="58" height="58" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#6A1B9A" strokeWidth="2" fill="none"/>
                                <path d="M22 6l-10 7L2 6" stroke="#6A1B9A" strokeWidth="2" fill="none"/>
                            </svg>
                        </motion.div>
                        <h2 style={{ color: '#6A1B9A', marginBottom: '15px' }}>Vérifiez vos emails</h2>
                        <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '25px' }}>
                            Un lien a été envoyé à <strong>{email}</strong>.
                        </p>
                        <Link href="/auth/login" className="btn btn-primary" style={{ display: 'block', textDecoration: 'none', padding: '12px', backgroundColor: '#6A1B9A', color: '#fff', borderRadius: '8px' }}>
                            Retour à la connexion
                        </Link>
                        <button 
                            onClick={() => setIsSubmitted(false)} 
                            style={{ background: 'none', border: 'none', color: '#6A1B9A', marginTop: '20px', cursor: 'pointer', fontSize: '0.9em' }}
                        >
                            Renvoyer l'email
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}