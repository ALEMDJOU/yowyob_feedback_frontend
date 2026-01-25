'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { projectService } from '@/lib/services/project.service';

export default function CreateProjectPage() {
    const router = useRouter();
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
            const publicUrl = await projectService.uploadLogoToSupabase(file);
            setFormData(prev => ({ ...prev, project_logo: publicUrl }));
        } catch (err: any) {
            alert(err.message || "Erreur lors de l'upload de l'image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.project_name.trim() || !formData.description.trim()) {
            alert('Veuillez remplir tous les champs obligatoires');
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
        } catch (err: any) {
            alert(err.message || 'Erreur lors de la création du projet');
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

                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    padding: '40px 20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '40px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #E5E7EB',
                        textAlign: 'center'
                    }}>
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

                        <h1 style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            color: '#1F2937',
                            marginBottom: '12px'
                        }}>
                            Groupe créé avec succès !
                        </h1>

                        <p style={{
                            fontSize: '1rem',
                            color: '#6B7280',
                            marginBottom: '32px'
                        }}>
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
                                      alert('Lien d\'invitation copié.');
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

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <Link
                                href="/dashboard/project"
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#F3F4F6',
                                    color: '#1F2937',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    display: 'inline-block'
                                }}
                            >
                                Retour aux projets
                            </Link>

                            <button
                                onClick={() => router.push(`/dashboard/project/${encodeURIComponent(createdProjectName)}`)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#7C3AED',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
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

            <div style={{
                maxWidth: '700px',
                margin: '0 auto',
                padding: '20px'
            }}>
                <Link
                    href="/dashboard/project"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#7C3AED',
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

                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    border: '1px solid #E5E7EB'
                }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>
                        Créer un nouveau groupe
                    </h1>
                    <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '32px' }}>
                        Remplissez les informations ci-dessous pour créer votre groupe de projet
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
                                Photo du groupe
                            </label>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '12px',
                                    border: '2px solid #E5E7EB',
                                    overflow: 'hidden',
                                    background: '#F3F4F6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
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
                                    display: 'inline-block'
                                }}>
                                    <i className="fas fa-upload" style={{ marginRight: '8px' }}></i>
                                    Choisir une image
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label htmlFor="name" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
                                Nom du groupe <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.project_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                                placeholder="Ex: Groupe BD, Projet React..."
                                required
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label htmlFor="description" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
                                Description <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Décrivez brièvement l'objectif de ce groupe..."
                                required
                                rows={4}
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Link
                                href="/dashboard/project"
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#F3F4F6',
                                    color: '#1F2937',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                }}
                            >
                                Annuler
                            </Link>

                            <button
                                type="submit"
                                disabled={submitting || uploading}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: submitting || uploading ? '#A78BFA' : '#7C3AED',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: submitting || uploading ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
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