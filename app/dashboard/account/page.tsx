"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/components/I18nProvider';
import { userService } from '@/lib/services';
import { UserResponseDTO, UserType } from '@/lib/types/api';
import { useToast } from '@/components/ToastProvider';

export default function FollowerIndexPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getCurrentUser();
        setUser(data);
      } catch (error) {
        showToast("Impossible de charger les informations du profil.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [showToast]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Veuillez vous reconnecter.</div>;

  const displayName = user.user_type === UserType.PERSON
    ? `${user.user_firstname} ${user.user_lastname}`
    : user.user_lastname;

  const displayHandle = user.email?.split('@')[0] || 'user';

  return (
    <>
      <div className="content-header">
        <div className="header-title">
          <h1>{t('account.title')}</h1>
        </div>
      </div>

      <div className="profile-page">
        <section className="profile-header-ig">
          <div className="profile-avatar-container-ig">
            <Image src={user.user_logo || "/images/porw.jpg"} alt="Photo de profil" width={150} height={150} className="profile-avatar-ig" style={{ objectFit: 'cover' }} />
          </div>

          <div className="profile-info-container-ig">
            <div className="profile-top-row-ig">
              <h1 className="profile-username-ig">{displayHandle}</h1>
              {user.certified && <i className="fas fa-check-circle certified-icon-ig"></i>}
              <Link href="/dashboard/account/edit" className="btn btn-secondary edit-profile-btn-ig">
                {t('account.editProfile')}
              </Link>
              <a href="#" className="settings-icon-ig" aria-label="Paramètres du compte">
                <i className="fas fa-cog"></i>
              </a>
            </div>

            <div className="profile-stats-ig">
              <span className="stat-item-ig"><span className="stat-number">...</span> {t('account.stats_feedbacks')}</span>
              <Link href="#" className="stat-item-ig link"><span className="stat-number">...</span> {t('account.stats_followers')}</Link>
              <Link href="#" className="stat-item-ig link"><span className="stat-number">...</span> {t('account.stats_following')}</Link>
            </div>

            <div className="profile-bio-ig">
              <p className="profile-name-ig">{displayName}</p>
              <p className="profile-description-ig">
                {(() => {
                  const desc = user.description || "";
                  const match = desc.match(/(.*)\s\[Location:\s(.*)\]$/);
                  return match ? match[1] : (desc || "Aucune description");
                })()}
              </p>
              {user.domain && <p className="profile-domain-ig" style={{ fontSize: '0.9rem', color: '#6A1B9A' }}><strong>{user.domain}</strong></p>}
              <a href="#" className="profile-website-ig">
                {(() => {
                  if (user.location) return user.location;
                  const match = (user.description || "").match(/\[Location:\s(.*)\]$/);
                  return match ? match[1] : "Cameroun";
                })()}
              </a>
            </div>
          </div>
        </section>

        <hr className="separator-ig" />

        <div className="profile-main-content-grid-list">
          <div className="feedbacks-column-ig">
            <h3 className="section-title"><i className="fas fa-comment-dots"></i> {t('account.section_feedbacks')}</h3>
            <p style={{ color: '#888', fontStyle: 'italic', padding: '10px' }}>Vos feedbacks apparaîtront ici.</p>
          </div>

          <div className="discover-column-ig">
            <h3 className="section-title"><i className="fas fa-search-plus"></i> {t('account.section_discover')}</h3>
            <p style={{ color: '#888', fontStyle: 'italic', padding: '10px' }}>Découvrez d'autres acteurs de Yowyob.</p>
          </div>
        </div>
      </div>
    </>
  );
}
