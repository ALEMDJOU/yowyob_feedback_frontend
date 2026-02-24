'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { projectService } from '@/lib/services/project.service';
import { useToast } from '@/components/ToastProvider';

export default function CreateProjectPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        project_name: '',
        description: '',
        project_logo: ''
    });
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [isCreated, setIsCreated] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createdProjectName, setCreatedProjectName] = useState<string>('');
    const [createdCreatorId, setCreatedCreatorId] = useState<string>('');

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const objectUrl = URL.createObjectURL(file);
            setAvatarPreview(objectUrl);
            const publicUrl = await projectService.uploadLogo(file);
            setFormData(prev => ({ ...prev, project_logo: publicUrl }));
            showToast("Logo téléchargé !", "success");
        } catch (err: any) {
            showToast(err.message || "Erreur lors de l'upload de l'image", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.project_name.trim() || !formData.description.trim()) {
            showToast('Veuillez remplir tous les champs obligatoires', "error");
            return;
        }
        setSubmitting(true);
        try {
            const created = await projectService.createProject({
                project_name: formData.project_name,
                description: formData.description,
                project_logo: formData.project_logo || undefined,
            });
            setGeneratedCode(created.code);
            setCreatedProjectName(created.project_name);
            setCreatedCreatorId(created.creator_id);
            setIsCreated(true);
            showToast("Groupe créé !", "success");
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de la création du projet', "error");
        } finally {
            setSubmitting(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    if (isCreated) {
        return (
            <>
                <link rel="stylesheet" href="/feed.css" />

                <div className="project-form-wrapper">
                    <div className="project-form-card" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 24px',
                            background: '#10B981',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i className="fas fa-check" style={{ fontSize: '2.5rem', color: 'white' }}></i>
                        </div>

                        <h1 className="project-form-header">
                            Groupe créé avec succès !
                        </h1>

                        <p className="project-form-subtitle">
                            Votre groupe <strong>{createdProjectName}</strong> a été créé.
                        </p>

                        <div style={{
                            background: '#F9FAFB',
                            border: '2px dashed #7C3AED',
                            borderRadius: '12px',
                            padding: '24px',
                            marginBottom: '24px'
                        }}>
                            {/* Lien d'invitation simplifié */}
                            {createdProjectName && createdCreatorId && (
                                <div style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: 8,
                                    padding: '12px',
                                    marginBottom: 16
                                }}>
                                    <div style={{ fontWeight: 700, marginBottom: 6, color: '#111827' }}>
                                        Lien d'invitation (à partager)
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        gap: 8,
                                        alignItems: 'center',
                                        flexWrap: 'wrap'
                                    }}>
                                        <code style={{
                                            background: '#F3F4F6',
                                            border: '1px solid #E5E7EB',
                                            padding: '8px 10px',
                                            borderRadius: 6,
                                            fontSize: '0.85rem',
                                            color: '#374151'
                                        }}>
                                            {`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/project/join?project=${encodeURIComponent(createdProjectName)}&creator=${encodeURIComponent(createdCreatorId)}`}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const link = `${window.location.origin}/dashboard/project/join?project=${encodeURIComponent(createdProjectName)}&creator=${encodeURIComponent(createdCreatorId)}`;
                                                navigator.clipboard.writeText(link);
                                                showToast('Lien d\'invitation copié.', "success");
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                background: '#7C3AED',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 6,
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Copier le lien
                                        </button>
                                    </div>
                                    <p style={{ color: '#6B7280', marginTop: 8, marginBottom: 0 }}>
                                        Le destinataire n'aura qu'à saisir <strong>le code</strong> et <strong>son pseudo</strong>.
                                    </p>
                                </div>
                            )}
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#6B7280',
                                marginBottom: '12px',
                                fontWeight: 600
                            }}>
                                Code d'adhésion au groupe
                            </p>

                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: '#7C3AED',
                                fontFamily: 'monospace',
                                letterSpacing: '4px',
                                marginBottom: '16px'
                            }}>
                                {generatedCode}
                            </div>

                            <button
                                onClick={copyCode}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: copiedCode ? '#10B981' : '#7C3AED',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <i className={`fas ${copiedCode ? 'fa-check' : 'fa-copy'}`}></i>
                                {copiedCode ? 'Code copié !' : 'Copier le code'}
                            </button>

                            <p style={{
                                fontSize: '0.85rem',
                                color: '#9CA3AF',
                                marginTop: '16px',
                                lineHeight: 1.5
                            }}>
                                <i className="fas fa-info-circle"></i> Partagez ce code avec les personnes que vous souhaitez inviter dans ce groupe.
                            </p>
                        </div>

                        <div className="project-form-actions" style={{ justifyContent: 'center' }}>
                            <Link
                                href="/dashboard/project"
                                className="project-btn-cancel"
                            >
                                Retour aux projets
                            </Link>

                            <button
                                onClick={() => router.push(`/dashboard/project/${encodeURIComponent(createdProjectName)}`)}
                                className="project-btn-submit"
                            >
                                Accéder au groupe
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <link rel="stylesheet" href="/feed.css" />

            <div className="project-form-wrapper">
                <Link
                    href="/dashboard/project"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--primary-color)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        marginBottom: '24px',
                        transition: 'color 0.2s'
                    }}
                >
                    <i className="fas fa-arrow-left"></i>
                    Retour aux projets
                </Link>

                <div className="project-form-card">
                    <h1 className="project-form-header">
                        Créer un nouveau groupe
                    </h1>
                    <p className="project-form-subtitle">
                        Remplissez les informations ci-dessous pour créer votre groupe de projet
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="project-form-group">
                            <label className="project-form-label">
                                Photo du groupe
                            </label>

                            <div className="project-image-upload" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '12px',
                                    border: '2px solid #E5E7EB',
                                    overflow: 'hidden',
                                    background: '#F3F4F6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <i className="fas fa-image" style={{ fontSize: '2rem', color: '#9CA3AF' }}></i>
                                    )}
                                </div>

                                <label style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#F3F4F6',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    color: '#1F2937',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-block',
                                    textAlign: 'center'
                                }}>
                                    <i className="fas fa-upload" style={{ marginRight: '8px' }}></i>
                                    Choisir une image
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>

                        <div className="project-form-group">
                            <label htmlFor="name" className="project-form-label">
                                Nom du groupe <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.project_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                                placeholder=""
                                required
                                className="project-form-input"
                            />
                        </div>

                        <div className="project-form-group" style={{ marginBottom: '32px' }}>
                            <label htmlFor="description" className="project-form-label">
                                Description <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder=""
                                required
                                rows={4}
                                className="project-form-input"
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="project-form-actions">
                            <Link
                                href="/dashboard/project"
                                className="project-btn-cancel"
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={submitting || uploading}
                                className="project-btn-submit"
                                style={{
                                    backgroundColor: submitting || uploading ? '#A78BFA' : 'var(--primary-color)'
                                }}
                            >
                                <i className="fas fa-plus-circle"></i>
                                {submitting ? 'Création...' : (uploading ? 'Upload image...' : 'Créer le groupe')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}