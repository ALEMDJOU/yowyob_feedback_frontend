"use client";
import React from 'react';
import Image from 'next/image';
// styles are imported by the follower layout
import { useTranslation } from '@/components/I18nProvider';

export default function FollowerEditPage() {
  const { t } = useTranslation();
  return (
    <>
      <div className="content-header">
        <div className="header-title">
          <button id="toggleSidebar" className="sidebar-toggle" aria-label="Toggle Sidebar">
            <i className="fas fa-bars"></i>
          </button>
          <h1>{t('profileEdit.editTitle')}</h1>
        </div>
      </div>

      <section className="edit-profile-section">
          <form id="profile-edit-form" className="edit-form-card">
          <h3>{t('profileEdit.generalInfo')}</h3>

          <div className="form-group avatar-upload-group">
            <Image src="/images/porw.jpg" alt="Photo de profil actuelle" width={80} height={80} className="current-avatar" />
            <div>
              <label htmlFor="profile_photo">{t('profileEdit.changePhoto')}</label>
              <input type="file" id="profile_photo" name="profile_photo" accept="image/*" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="first_name">{t('profileEdit.firstName')}</label>
            <input type="text" id="first_name" name="first_name" defaultValue="Henri" required />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">{t('profileEdit.lastName')}</label>
            <input type="text" id="last_name" name="last_name" defaultValue="Duval" required />
          </div>

          <div className="form-group">
            <label htmlFor="username">{t('profileEdit.username')}</label>
            <input type="text" id="username" name="username" defaultValue="Henri_Duval_Dev" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('profileEdit.email')}</label>
            <input type="email" id="email" name="email" defaultValue="henri.duval@yowyob.com" required />
          </div>

          <div className="form-group">
            <label htmlFor="contact">{t('profileEdit.contact')}</label>
            <input type="tel" id="contact" name="contact" defaultValue="+33 6 12 34 56 78" />
          </div>

          <div className="form-group">
            <label htmlFor="domaine">{t('profileEdit.domain')}</label>
            <input type="text" id="domaine" name="domaine" defaultValue="Développement Full Stack" required />
          </div>

          <div className="form-group">
            <label htmlFor="bio">{t('profileEdit.bio')}</label>
            <textarea id="bio" name="bio" rows={4} defaultValue={"Développeur Full Stack passionné par les systèmes de feedback utilisateur et la création d'interfaces intuitives."}></textarea>
          </div>

          <button type="submit" className="btn btn-primary large-btn">{t('profileEdit.saveChanges')}</button>
        </form>

        <form id="password-edit-form" className="edit-form-card password-card">
          <h3>Changer de Mot de Passe</h3>

          <div className="form-group">
            <label htmlFor="current_password">Mot de Passe Actuel</label>
            <input type="password" id="current_password" name="current_password" required />
          </div>

          <div className="form-group">
            <label htmlFor="new_password">Nouveau Mot de Passe</label>
            <input type="password" id="new_password" name="new_password" required />
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirmer Nouveau Mot de Passe</label>
            <input type="password" id="confirm_password" name="confirm_password" required />
          </div>

          <button type="submit" className="btn btn-secondary large-btn">Mettre à Jour le Mot de Passe</button>
        </form>
      </section>
    </>
  );
}
