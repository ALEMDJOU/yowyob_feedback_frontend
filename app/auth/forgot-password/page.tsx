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

                        <motion.h2 variants={itemVariants} style={{ textAlign: 'center', marginBottom: '10px', color: '#6A1B9A' }}>
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
                                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
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
                            style={{ fontSize: '60px', marginBottom: '20px' }}
                        >
                            📩
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