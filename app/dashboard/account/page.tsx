"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/components/I18nProvider';

// styles are imported by the follower layout

export default function FollowerIndexPage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="content-header">
        <div className="header-title">
          {/* Sidebar toggle moved to Layout */}
          <h1>{t('account.title')}</h1>
        </div>
      </div>

      <div className="profile-page">
        <section className="profile-header-ig">
          <div className="profile-avatar-container-ig">
            <Image src="/images/porw.jpg" alt="Photo de profil" width={150} height={150} className="profile-avatar-ig" />
          </div>

          <div className="profile-info-container-ig">
            <div className="profile-top-row-ig">
              <h1 className="profile-username-ig">henri_fofack_dev</h1>
              <i className="fas fa-check-circle certified-icon-ig"></i>
              <Link href="/follower/edit" className="btn btn-secondary edit-profile-btn-ig">
                {t('account.editProfile')}
              </Link>
              <a href="#" className="settings-icon-ig" aria-label="Paramètres du compte">
                <i className="fas fa-cog"></i>
              </a>
            </div>

            <div className="profile-stats-ig">
              <span className="stat-item-ig"><span className="stat-number">42</span> {t('account.stats_feedbacks')}</span>
              <Link href="#" className="stat-item-ig link"><span className="stat-number">1,234</span> {t('account.stats_followers')}</Link>
              <Link href="#" className="stat-item-ig link"><span className="stat-number">150</span> {t('account.stats_following')}</Link>
            </div>

            <div className="profile-bio-ig">
              <p className="profile-name-ig">Henri Fofack | utilisateur yowyob depuis 4 ans</p>
              <p className="profile-description-ig">Développeur d'applications | CEO de Yowyob Feedback.</p>
              <a href="#" className="profile-website-ig">https://yowyob.com</a>
            </div>
          </div>
        </section>

        <hr className="separator-ig" />

        <div className="profile-main-content-grid-list">
          <div className="feedbacks-column-ig">
            <h3 className="section-title"><i className="fas fa-comment-dots"></i> {t('account.section_feedbacks')}</h3>

            <div className="feedback-item-card">
              <div className="feedback-meta-header">
                <Image src="/images/lesour.jpg" alt="Auteur" width={40} height={40} className="meta-avatar" />
                <div className="meta-info">
                  <span className="meta-username">user1234</span>
                  <span className="meta-date">{t('account.ago', { time: '3 jours' })}</span>
                </div>
              </div>
              <p className="feedback-text">"Excellente réactivité sur le bug reporté. L'équipe d'Henri a corrigé l'erreur en moins de 48h ! Continuez comme ça."</p>
              <div className="feedback-actions">
                <button className="action-btn"><i className="fas fa-heart"></i> 12</button>
                <button className="action-btn"><i className="fas fa-reply"></i> {t('account.reply')}</button>
              </div>
            </div>

            <a href="#" className="btn btn-secondary btn-block view-all-btn">{t('account.viewAllFeedbacks')}</a>
          </div>

          <div className="discover-column-ig">
            <h3 className="section-title"><i className="fas fa-search-plus"></i> {t('account.section_discover')}</h3>

            <div className="suggestion-card-ig">
              <Link href="/follower/user/sophie_martin_dev" className="suggestion-link">
                <Image src="/images/porwel.jpg" alt="Profil suggéré 1" width={45} height={45} className="suggestion-avatar-ig" />
                <div className="suggestion-info-ig">
                  <span className="suggestion-username-ig">
                    sophie_martin_dev
                    <i className="fas fa-check-circle certified-icon-ig"></i>
                  </span>
                  <span className="suggestion-context-ig">{t('account.suggestedForYou')}</span>
                </div>
              </Link>
              <button className="btn btn-primary btn-follow-ig">{t('account.follow')}</button>
            </div>

            <a href="#" className="view-all-link-ig" id="toggleSuggestions">{t('account.viewAllSuggestions')}</a>
          </div>
        </div>
      </div>
    </>
  );
}
