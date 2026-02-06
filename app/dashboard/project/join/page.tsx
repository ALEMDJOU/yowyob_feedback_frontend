'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { projectService, JoinProjectRequestDTO } from '@/lib/services/project.service';
import { useToast } from '@/components/ToastProvider';
import { useTranslation } from '@/components/I18nProvider';

function JoinProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetProject = searchParams.get('project') || '';
  const presetCreator = searchParams.get('creator') || '';

  const { showToast } = useToast();
  const { t } = useTranslation();
  const [projectName, setProjectName] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [code, setCode] = useState('');
  const [memberPseudo, setMemberPseudo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (presetProject) setProjectName(presetProject);
    if (presetCreator) setCreatorId(presetCreator);
  }, [presetProject, presetCreator]);

  const hasPreset = Boolean(presetProject && presetCreator);

  const isValidCode = (val: string) => /^[A-Za-z0-9]{6}$/.test(val);
  const isUUID = (val: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim() || !creatorId.trim() || !memberPseudo.trim() || !code.trim()) {
      showToast('Veuillez remplir tous les champs.', "error");
      return;
    }

    if (!isUUID(creatorId.trim())) {
      showToast("L'ID du créateur doit être un UUID valide.", "error");
      return;
    }

    if (!isValidCode(code.trim())) {
      showToast('Le code doit comporter exactement 6 caractères alphanumériques.', "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload: JoinProjectRequestDTO = {
        projectName: projectName.trim(),
        creatorId: creatorId.trim(),
        code: code.trim().toUpperCase(),
        memberPseudo: memberPseudo.trim(),
      };
      await projectService.joinProject(payload);

      showToast("Vous avez rejoint le projet !", "success");
      router.push(`/dashboard/project/${encodeURIComponent(projectName.trim())}`);
    } catch (err: any) {
      if (err?.status === 404) {
        showToast('Projet introuvable ou code invalide.', "error");
      } else if (err?.status === 409) {
        showToast("Vous êtes déjà membre de ce projet. Redirection...", "success");
        router.push(`/dashboard/project/${encodeURIComponent(projectName.trim())}`);
      } else if (err?.message) {
        showToast(err.message, "error");
      } else {
        showToast('Erreur inattendue lors de la tentative de rejoindre le projet.', "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/feed.css" />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
        <Link
          href="/dashboard/project"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#7C3AED', textDecoration: 'none', fontSize: '0.95rem',
            fontWeight: 600, marginBottom: 24
          }}
        >
          <i className="fas fa-arrow-left"></i>
          Retour aux projets
        </Link>

        <div style={{
          background: '#fff', borderRadius: 12, padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
            Rejoindre un projet par code
          </h1>
          <p style={{ color: '#6B7280', marginBottom: 20 }}>
            Entrez le nom du projet, le code du créateur, le code à 6 caractères et votre pseudo.
          </p>

          {/* Erreurs gérées par Toasts */}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 16 }}>
              {hasPreset && (
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>Projet ciblé</div>
                  <div style={{ color: '#6B7280' }}>
                    {projectName} • Créateur: {creatorId ? `${creatorId.slice(0, 8)}…` : ''}
                  </div>
                </div>
              )}

              <div style={{ display: hasPreset ? 'none' : 'block' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Nom du projet</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder=""
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB',
                    borderRadius: 8, fontSize: '0.95rem'
                  }}
                  required={!hasPreset}
                />
              </div>

              <div style={{ display: hasPreset ? 'none' : 'block' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Code du créateur</label>
                <input
                  type="text"
                  value={creatorId}
                  onChange={(e) => setCreatorId(e.target.value)}
                  placeholder=""
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB',
                    borderRadius: 8, fontSize: '0.95rem'
                  }}
                  required={!hasPreset}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{t('joinProject.codeLabel')}</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder=""
                  maxLength={6}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB',
                    borderRadius: 8, fontSize: '0.95rem', letterSpacing: 2, textTransform: 'uppercase'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Votre pseudo</label>
                <input
                  type="text"
                  value={memberPseudo}
                  onChange={(e) => setMemberPseudo(e.target.value)}
                  placeholder=""
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB',
                    borderRadius: 8, fontSize: '0.95rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <Link
                  href="/dashboard/project"
                  style={{
                    padding: '10px 16px', background: '#F3F4F6', border: '1px solid #E5E7EB',
                    color: '#111827', borderRadius: 8, textDecoration: 'none', fontWeight: 600
                  }}
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 16px', background: submitting ? '#A78BFA' : '#7C3AED',
                    color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Vérification...' : 'Rejoindre le projet'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function JoinProjectPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 20, textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    }>
      <JoinProjectForm />
    </Suspense>
  );
}