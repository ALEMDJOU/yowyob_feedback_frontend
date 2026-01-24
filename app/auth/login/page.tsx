"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/I18nProvider';
import { authService } from '@/lib/services';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Variantes d'animation
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login({ identifier, password });
      router.push('/dashboard/feed');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ overflow: 'hidden', perspective: '1000px' }}>
      <motion.div 
        initial="hidden"
        animate="visible"
        whileHover={{ rotateY: -1, rotateX: 1 }} // Effet 3D léger au survol
        className="auth-card auth-staggered"
        style={{ boxShadow: '0 20px 50px rgba(106, 27, 154, 0.15)' }}
      >
        {/* Retour arrière animé */}
        <motion.div variants={itemVariants} whileHover={{ x: -5 }}>
          <Link href="/" style={{ color: '#666', fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
             <motion.span animate={{ x: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>←</motion.span> 
             {t('auth.back')}
          </Link>
        </motion.div>

        {/* Logo avec effet de pulsation */}
        <motion.div 
          variants={itemVariants}
          style={{ textAlign: 'center', marginBottom: '25px' }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image src="/images/logo.jpg" alt="Logo" width={70} height={70} style={{ borderRadius: '50%', border: '3px solid #f3e5f5' }} />
          </motion.div>
          <motion.h2 
            initial={{ letterSpacing: '0px' }}
            animate={{ letterSpacing: '1px' }}
            style={{ color: '#6A1B9A', marginTop: '10px', fontWeight: '800' }}
          >
            {t('auth.loginTitle')}
          </motion.h2>
        </motion.div>

        {/* Erreur avec secousse */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: 0 }}
              animate={{ opacity: 1, scale: 1, x: [0, -10, 10, -10, 10, 0] }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{ color: 'red', backgroundColor: '#FEE', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9em', textAlign: 'center', border: '1px solid #ffcdd2' }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin}>
          <motion.div variants={itemVariants} className="auth-form-group">
            <label htmlFor="identifier" style={{ fontWeight: '600', color: '#444' }}>Email ou Contact</label>
            <motion.input
              whileFocus={{ scale: 1.01, borderColor: '#6A1B9A' }}
              type="text"
              id="identifier"
              className="auth-form-control"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="votre@email.com"
              style={{ transition: 'all 0.3s' }}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="auth-form-group" style={{ position: 'relative' }}>
            <label htmlFor="password" style={{ fontWeight: '600', color: '#444' }}>{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <motion.input
                whileFocus={{ scale: 1.01, borderColor: '#6A1B9A' }}
                type={showPassword ? "text" : "password"}
                id="password"
                className="auth-form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingRight: '45px', transition: 'all 0.3s' }}
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.2, color: '#4A148C' }}
                whileTap={{ scale: 0.8 }}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#6A1B9A', fontSize: '1.3em'
                }}
              >
                {showPassword ? '👁️' : '🙈'}
              </motion.button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '25px' }}>
             <Link href="/auth/forgot-password" style={{ color: '#6A1B9A', fontSize: '0.85em', fontWeight: '500' }}>
              {t('auth.forgotPassword')}
            </Link>
          </motion.div>

          {/* Bouton avec effet de brillance (Shine) */}
          <motion.button 
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: '0 10px 20px rgba(106, 27, 154, 0.3)',
            }}
            whileTap={{ scale: 0.97 }}
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', padding: '14px', backgroundColor: '#6A1B9A', color: 'white', 
              border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold', fontSize: '1em', position: 'relative', overflow: 'hidden'
            }} 
            disabled={loading}
          >
            {loading ? (
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity }}>
                🔄 Connexion en cours...
              </motion.span>
            ) : (
              t('auth.loginButton')
            )}
            
            {/* Animation de reflet qui passe sur le bouton */}
            {!loading && (
              <motion.div
                style={{
                  position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                }}
                animate={{ left: '200%' }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
              />
            )}
          </motion.button>
        </form>

        <motion.div variants={itemVariants} style={{ marginTop: '25px', textAlign: 'center', color: '#666' }}>
          {t('auth.noAccount')}{' '}
          <Link href="/auth/signup" style={{ color: '#6A1B9A', fontWeight: '800', textDecoration: 'none' }}>
            <motion.span whileHover={{ textDecoration: 'underline' }}>
              {t('auth.registerLink')}
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}