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

      <div className="project-form-wrapper">
        <Link
          href="/dashboard/project"
          className="back-link"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.95rem',
            fontWeight: 600, marginBottom: 24, transition: 'color 0.2s'
          }}
        >
          <i className="fas fa-arrow-left"></i>
          Retour aux projets
        </Link>

        <div className="project-form-card">
          <h1 className="project-form-header">
            Rejoindre un projet par code
          </h1>
          <p className="project-form-subtitle">
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

              <div className="project-form-group" style={{ display: hasPreset ? 'none' : 'block' }}>
                <label className="project-form-label">Nom du projet</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder=""
                  className="project-form-input"
                  required={!hasPreset}
                />
              </div>

              <div className="project-form-group" style={{ display: hasPreset ? 'none' : 'block' }}>
                <label className="project-form-label">Code du créateur</label>
                <input
                  type="text"
                  value={creatorId}
                  onChange={(e) => setCreatorId(e.target.value)}
                  placeholder=""
                  className="project-form-input"
                  required={!hasPreset}
                />
              </div>

              <div className="project-form-group">
                <label className="project-form-label">{t('joinProject.codeLabel')}</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder=""
                  maxLength={6}
                  className="project-form-input"
                  style={{ letterSpacing: 2, textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div className="project-form-group">
                <label className="project-form-label">Votre pseudo</label>
                <input
                  type="text"
                  value={memberPseudo}
                  onChange={(e) => setMemberPseudo(e.target.value)}
                  placeholder=""
                  className="project-form-input"
                  required
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
                  disabled={submitting}
                  className="project-btn-submit"
                  style={{
                    backgroundColor: submitting ? '#A78BFA' : 'var(--primary-color)'
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