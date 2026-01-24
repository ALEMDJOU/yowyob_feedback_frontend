"use client"
import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/lib/services';
import { UserType, RegisterRequestDTO } from '@/lib/types/api';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
    const router = useRouter();
    const [userType, setUserType] = useState<UserType>(UserType.PERSON);
    const [uploading, setUploading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [formData, setFormData] = useState<Partial<RegisterRequestDTO>>({
        user_type: UserType.PERSON,
        email: '',
        password: '',
        contact: '',
        user_firstname: '',
        user_lastname: '',
        occupation: '',
        organization_name: '',
        user_logo: '',
        location: '',
        description: '',
        domain: '' 
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Validation Regex
    const cameroonPhoneRegex = /^(2|6)[0-9]{8}$/; 
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Helper pour la validation visuelle du mot de passe
    const passwordMetadata = {
        hasMinLength: (formData.password?.length || 0) >= 8,
        hasUpper: /[A-Z]/.test(formData.password || ''),
        hasLower: /[a-z]/.test(formData.password || ''),
        hasNumber: /\d/.test(formData.password || ''),
        hasSpecial: /[@$!%*?&]/.test(formData.password || '')
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    const handleInputChange = (field: keyof RegisterRequestDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validations locales
        if (!cameroonPhoneRegex.test(formData.contact || '')) {
            return setError("Numéro de téléphone invalide. Utilisez un format camerounais à 9 chiffres (ex: 6XXXXXXXX).");
        }

        if (!passwordRegex.test(formData.password || '')) {
            return setError("Le mot de passe ne respecte pas toutes les consignes de sécurité.");
        }

        if (formData.password !== confirmPassword) {
            return setError("Les mots de passe ne correspondent pas.");
        }

        setLoading(true);
        try {
            // MAPPING STRICT POUR LA BASE DE DONNÉES
            const finalData = { ...formData };
            if (userType === UserType.ORGANIZATION) {
                // On mappe obligatoirement organization_name vers user_lastname pour la BD
                finalData.user_lastname = formData.organization_name;
                finalData.user_firstname = ''; 
                finalData.occupation = ''; 
            }

            await authService.register(finalData as RegisterRequestDTO);
            router.push('/dashboard/feed');
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'inscription.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            setError(null);
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];
            const filePath = `profiles/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage.from('yowyob_feedback').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('yowyob_feedback').getPublicUrl(filePath);
            handleInputChange('user_logo', data.publicUrl);
        } catch (err: any) {
            setError("Erreur upload image: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const Requirement = ({ met, text }: { met: boolean, text: string }) => (
        <div style={{ color: met ? '#2E7D32' : '#9e9e9e', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.3s' }}>
            <span>{met ? '●' : '○'}</span> {text}
        </div>
    );

    return (
        <div className="auth-page" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
            <motion.div initial="hidden" animate="visible" className="auth-card" style={{ maxWidth: '750px', margin: '0 auto', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', borderRadius: '16px', backgroundColor: '#fff' }}>
                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <Image src="/images/logo.jpg" alt="Logo" width={80} height={80} style={{ borderRadius: '50%' }} />
                    <h2 style={{ color: '#6A1B9A', marginTop: '15px', fontWeight: '800' }}>Rejoignez l'aventure</h2>
                    <p style={{ color: '#888' }}>Sécurité et confidentialité garanties sur Yowyob</p>
                </motion.div>

                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <div style={{ color: '#D32F2F', backgroundColor: '#FFEBEE', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9em', border: '1px solid #FFCDD2' }}>
                                ⚠️ {error}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSignup}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Type de compte</label>
                            <select 
                                className="auth-form-control" 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #eee' }} 
                                value={userType} 
                                onChange={(e) => { 
                                    const val = e.target.value as UserType; 
                                    setUserType(val); 
                                    handleInputChange('user_type', val); 
                                }}
                            >
                                <option value={UserType.PERSON}>👤 Particulier</option>
                                <option value={UserType.ORGANIZATION}>🏢 Entreprise / Organisation</option>
                            </select>
                        </div>

                        <AnimatePresence mode="wait">
                            {userType === UserType.PERSON ? (
                                <motion.div key="person-fields" variants={itemVariants} initial="hidden" animate="visible" exit="hidden" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Prénom</label>
                                        <input type="text" className="auth-form-control" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('user_firstname', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nom</label>
                                        <input type="text" className="auth-form-control" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('user_lastname', e.target.value)} required />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Occupation / Profession</label>
                                        <input type="text" className="auth-form-control" placeholder="Ex: Étudiant, Développeur..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('occupation', e.target.value)} required />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="org-fields" variants={itemVariants} initial="hidden" animate="visible" exit="hidden" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nom de l'organisation</label>
                                    <input 
                                        type="text" 
                                        className="auth-form-control" 
                                        placeholder="Ex: Yowyob Sarl" 
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
                                        onChange={(e) => handleInputChange('organization_name', e.target.value)} 
                                        required 
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div variants={itemVariants}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>🌐 Domaine d'activité</label>
                            <input type="text" className="auth-form-control" placeholder="Ex: Informatique, Commerce..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('domain', e.target.value)} required />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>📍 Localisation</label>
                            <input type="text" className="auth-form-control" placeholder="Ex: Douala, Cameroun" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('location', e.target.value)} required />
                        </motion.div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>📝 Description</label>
                            <textarea className="auth-form-control" rows={2} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Décrivez brièvement l'activité..." onChange={(e) => handleInputChange('description', e.target.value)} required />
                        </div>

                        <motion.div variants={itemVariants}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>📞 Téléphone (Cameroun)</label>
                            <input type="text" className="auth-form-control" placeholder="6XXXXXXXX" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('contact', e.target.value)} required />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>📧 Email</label>
                            <input type="email" className="auth-form-control" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('email', e.target.value)} required />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Mot de passe</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? "text" : "password"} className="auth-form-control" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('password', e.target.value)} required />
                                <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>{showPassword ? '🙈' : '👁️'}</span>
                            </div>
                            <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '6px' }}>
                                <Requirement met={passwordMetadata.hasMinLength} text="8+ caractères" />
                                <Requirement met={passwordMetadata.hasUpper} text="Majuscule" />
                                <Requirement met={passwordMetadata.hasLower} text="Minuscule" />
                                <Requirement met={passwordMetadata.hasNumber} text="Chiffre" />
                                <Requirement met={passwordMetadata.hasSpecial} text="Spécial (@$!%*?&)" />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Confirmation</label>
                            <input type={showPassword ? "text" : "password"} className="auth-form-control" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            {confirmPassword && (
                                <div style={{ fontSize: '0.75rem', marginTop: '4px', color: formData.password === confirmPassword ? '#2E7D32' : '#D32F2F' }}>
                                    {formData.password === confirmPassword ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe diffèrent'}
                                </div>
                            )}
                        </motion.div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>🖼️ Logo ou Photo</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }} />
                        </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ width: '100%', padding: '16px', marginTop: '30px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }} disabled={loading || uploading}>
                        {loading ? '🚀 Traitement...' : 'Créer mon compte sécurisé'}
                    </motion.button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center', color: '#666' }}>
                    Déjà inscrit ? <Link href="/auth/login" style={{ color: '#6A1B9A', fontWeight: '800', textDecoration: 'none' }}>Connexion</Link>
                </div>
            </motion.div>
        </div>
    );
}