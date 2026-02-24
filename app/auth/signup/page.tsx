"use client"
import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/lib/services';
import { UserType, RegisterRequestDTO } from '@/lib/types/api';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ToastProvider';

export default function SignupPage() {
    const router = useRouter();
    const [userType, setUserType] = useState<UserType>(UserType.PERSON);
    const [uploading, setUploading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const [formData, setFormData] = useState<Partial<RegisterRequestDTO>>({
        // ... same
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

    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

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
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    const handleInputChange = (field: keyof RegisterRequestDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep1 = () => {
        if (userType === UserType.PERSON) {
            if (!formData.user_firstname || !formData.user_lastname) {
                showToast("Veuillez remplir votre nom et prénom.", "error");
                return false;
            }
        } else {
            if (!formData.organization_name) {
                showToast("Veuillez saisir le nom de l'organisation.", "error");
                return false;
            }
        }

        if (!formData.domain || !formData.contact || !formData.email) {
            showToast("Veuillez remplir les informations de contact et le domaine d'activité.", "error");
            return false;
        }

        if (!cameroonPhoneRegex.test(formData.contact || '')) {
            showToast("Numéro de téléphone invalide (format 9 chiffres : 6XXXXXXXX).", "error");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email || '')) {
            showToast("Veuillez saisir une adresse email valide.", "error");
            return false;
        }

        return true;
    };

    const nextStep = () => {
        if (validateStep1()) {
            setStep(2);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setStep(1);
        window.scrollTo(0, 0);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            nextStep();
            return;
        }

        // Validations locales Step 2
        if (userType === UserType.PERSON && !formData.occupation) {
            showToast("Veuillez renseigner votre profession.", "error");
            return;
        }

        if (!formData.location || !formData.description) {
            showToast("Veuillez renseigner votre localisation et une description.", "error");
            return;
        }

        if (!passwordRegex.test(formData.password || '')) {
            showToast("Le mot de passe ne respecte pas toutes les consignes de sécurité.", "error");
            return;
        }

        if (formData.password !== confirmPassword) {
            showToast("Les mots de passe ne correspondent pas.", "error");
            return;
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
            } else if (userType === UserType.PERSON && formData.location) {
                // WORKAROUND: The backend Person entity lacks a 'location' field.
                // We append it to the description to persist it without backend changes.
                finalData.description = `${formData.description} [Location: ${formData.location}]`;
            }

            await authService.register(finalData as RegisterRequestDTO);
            showToast("Inscription réussie !", "success");
            router.push('/dashboard/feed');
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de l\'inscription.', "error");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];
            const filePath = `profiles/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage.from('yowyob_feedback').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('yowyob_feedback').getPublicUrl(filePath);
            handleInputChange('user_logo', data.publicUrl);
            showToast("Image téléchargée avec succès !", "success");
        } catch (err: any) {
            showToast("Erreur upload image: " + err.message, "error");
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
                {/* Retour arrière animé */}
                <motion.div variants={itemVariants} whileHover={{ x: -5 }} style={{ marginBottom: '20px' }}>
                    <Link href="/" style={{ color: '#6A1B9A', fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                        <motion.span animate={{ x: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ display: 'inline-flex' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M15 19l-7-7 7-7" stroke="#6A1B9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.span>
                        Retour
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <Image src="/images/logo.jpg" alt="Logo" width={80} height={80} style={{ borderRadius: '50%' }} />
                    <h2 style={{ color: '#6A1B9A', marginTop: '15px', fontWeight: '800' }}>{step === 1 ? "Identité et Contact" : "Profil et Sécurité"}</h2>
                    <p style={{ color: '#888' }}>Étape {step} sur 2</p>

                    {/* Barre de progression */}
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '10px', marginTop: '15px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: '50%' }}
                            animate={{ width: step === 1 ? '50%' : '100%' }}
                            transition={{ duration: 0.5 }}
                            style={{ height: '100%', backgroundColor: '#6A1B9A' }}
                        />
                    </div>
                </motion.div>

                {/* Erreurs gérées par Toasts */}

                <form onSubmit={handleSignup}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="auth-grid-step"
                            >
                                <div className="auth-col-span-2">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Type de compte</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div
                                            onClick={() => {
                                                setUserType(UserType.PERSON);
                                                handleInputChange('user_type', UserType.PERSON);
                                            }}
                                            style={{
                                                padding: '15px', borderRadius: '10px', border: userType === UserType.PERSON ? '2px solid #6A1B9A' : '2px solid #eee',
                                                backgroundColor: userType === UserType.PERSON ? 'rgba(106, 27, 154, 0.05)' : 'white', cursor: 'pointer',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
                                            }}
                                        >
                                            <i className="fas fa-user" style={{ fontSize: '24px', color: userType === UserType.PERSON ? '#6A1B9A' : '#aaa' }}></i>
                                            <span style={{ fontWeight: userType === UserType.PERSON ? '700' : '500', color: userType === UserType.PERSON ? '#6A1B9A' : '#555' }}>Particulier</span>
                                        </div>
                                        <div
                                            onClick={() => {
                                                setUserType(UserType.ORGANIZATION);
                                                handleInputChange('user_type', UserType.ORGANIZATION);
                                            }}
                                            style={{
                                                padding: '15px', borderRadius: '10px', border: userType === UserType.ORGANIZATION ? '2px solid #6A1B9A' : '2px solid #eee',
                                                backgroundColor: userType === UserType.ORGANIZATION ? 'rgba(106, 27, 154, 0.05)' : 'white', cursor: 'pointer',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: 'all 0.2s', textAlign: 'center'
                                            }}
                                        >
                                            <i className="fas fa-building" style={{ fontSize: '24px', color: userType === UserType.ORGANIZATION ? '#6A1B9A' : '#aaa' }}></i>
                                            <span style={{ fontWeight: userType === UserType.ORGANIZATION ? '700' : '500', color: userType === UserType.ORGANIZATION ? '#6A1B9A' : '#555' }}>Entreprise / Organisation</span>
                                        </div>
                                    </div>
                                </div>

                                {userType === UserType.PERSON ? (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Prénom</label>
                                            <input type="text" className="auth-form-control" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('user_firstname', e.target.value)} value={formData.user_firstname || ''} required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nom</label>
                                            <input type="text" className="auth-form-control" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('user_lastname', e.target.value)} value={formData.user_lastname || ''} required />
                                        </div>
                                    </>
                                ) : (
                                    <div className="auth-col-span-2">
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nom de l'organisation</label>
                                        <input
                                            type="text"
                                            className="auth-form-control"
                                            placeholder="Ex: Yowyob Sarl"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                            onChange={(e) => handleInputChange('organization_name', e.target.value)}
                                            value={formData.organization_name || ''}
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#6A1B9A' }}>
                                        <i className="fas fa-globe" style={{ color: '#6A1B9A', marginRight: '6px' }}></i> Domaine d'activité
                                    </label>
                                    <input type="text" className="auth-form-control" placeholder="Ex: Informatique, Commerce..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('domain', e.target.value)} value={formData.domain || ''} required />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#6A1B9A' }}>
                                        <i className="fas fa-envelope" style={{ color: '#6A1B9A', marginRight: '6px' }}></i> Email
                                    </label>
                                    <input type="email" className="auth-form-control" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('email', e.target.value)} value={formData.email || ''} required />
                                </div>

                                <div className="auth-col-span-2">
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#6A1B9A' }}>
                                        <i className="fas fa-phone-alt" style={{ color: '#6A1B9A', marginRight: '6px' }}></i> Téléphone (Cameroun)
                                    </label>
                                    <input type="text" className="auth-form-control" placeholder="6XXXXXXXX" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('contact', e.target.value)} value={formData.contact || ''} required />
                                </div>

                                <div className="auth-col-span-2" style={{ marginTop: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        style={{ width: '100%', padding: '16px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="auth-grid-step"
                            >
                                {userType === UserType.PERSON && (
                                    <div className="auth-col-span-2">
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Occupation / Profession</label>
                                        <input type="text" className="auth-form-control" placeholder="Ex: Étudiant, Développeur..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('occupation', e.target.value)} value={formData.occupation || ''} required />
                                    </div>
                                )}

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#6A1B9A' }}>
                                        <i className="fas fa-map-marker-alt" style={{ color: '#6A1B9A', marginRight: '6px' }}></i> Localisation
                                    </label>
                                    <input type="text" className="auth-form-control" placeholder="Ex: Douala, Cameroun" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('location', e.target.value)} value={formData.location || ''} required />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#6A1B9A' }}>
                                        <i className="fas fa-align-left" style={{ color: '#6A1B9A', marginRight: '6px' }}></i> Description
                                    </label>
                                    <textarea className="auth-form-control" rows={2} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Décrivez brièvement l'activité..." onChange={(e) => handleInputChange('description', e.target.value)} value={formData.description || ''} required />
                                </div>

                                <div className="auth-col-span-2">
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#6A1B9A' }}>
                                        <i className="fas fa-image" style={{ color: '#6A1B9A', marginRight: '6px' }}></i> Logo ou Photo
                                    </label>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }} />
                                    {formData.user_logo && <p style={{ fontSize: '0.8rem', color: '#2E7D32', marginTop: '5px' }}><i className="fas fa-check" style={{ marginRight: '4px' }}></i> Image chargée</p>}
                                </div>

                                <div className="auth-col-span-2">
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Mot de passe</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPassword ? "text" : "password"} className="auth-form-control" style={{ width: '100%', padding: '12px', paddingRight: '45px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={(e) => handleInputChange('password', e.target.value)} required />
                                        <motion.button type="button" whileHover={{ color: '#4A148C' }} onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', background: 'none', border: 'none', color: '#6A1B9A', fontSize: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', padding: 0 }}>
                                            <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} style={{ width: '100%', textAlign: 'center' }}></i>
                                        </motion.button>
                                    </div>
                                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '6px' }}>
                                        <Requirement met={passwordMetadata.hasMinLength} text="8+ caractères" />
                                        <Requirement met={passwordMetadata.hasUpper} text="Majuscule" />
                                        <Requirement met={passwordMetadata.hasLower} text="Minuscule" />
                                        <Requirement met={passwordMetadata.hasNumber} text="Chiffre" />
                                        <Requirement met={passwordMetadata.hasSpecial} text="Spécial (@$!%*?&)" />
                                    </div>
                                </div>

                                <div className="auth-col-span-2">
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Confirmation</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPassword ? "text" : "password"} className="auth-form-control" style={{ width: '100%', padding: '12px', paddingRight: '45px', borderRadius: '8px', border: '1px solid #ddd' }} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    </div>
                                    {confirmPassword && (
                                        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: formData.password === confirmPassword ? '#2E7D32' : '#D32F2F' }}>
                                            {formData.password === confirmPassword ? <><i className="fas fa-check" style={{ marginRight: '4px' }}></i> Les mots de passe correspondent</> : <><i className="fas fa-times" style={{ marginRight: '4px' }}></i> Les mots de passe diffèrent</>}
                                        </div>
                                    )}
                                </div>

                                <div className="auth-col-span-2" style={{ display: 'flex', gap: '15px' }}>
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        style={{ flex: 1, padding: '16px', backgroundColor: '#f0f2f5', color: '#666', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Retour
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        style={{ flex: 2, padding: '16px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                        disabled={loading || uploading}
                                    >
                                        {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Traitement...</> : 'S\'inscrire'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center', color: '#666' }}>
                    Déjà inscrit ? <Link href="/auth/login" style={{ color: '#6A1B9A', fontWeight: '800', textDecoration: 'none' }}>Connexion</Link>
                </div>
            </motion.div>
        </div>
    );
}