"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/components/I18nProvider';
import { userService } from '@/lib/services/user.service';
import { UserResponseDTO, UserType } from '@/lib/types/api';

export default function FollowerIndexPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Configuration de l'URL de stockage
  const BUCKET_NAME = 'yowyob_feedback'; 
  const FOLDER_NAME = 'profiles';
  const SUPABASE_STORAGE_URL = `https://rwjlcxbvpoozggzkjfmi.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${FOLDER_NAME}/`;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getCurrentUser();
        setUser(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="loading-state" style={{padding: '50px', textAlign: 'center'}}>Chargement du profil...</div>;
  if (!user) return <div className="error-state" style={{padding: '50px', textAlign: 'center', color: 'red'}}>Erreur : Profil non trouvé.</div>;

  const isPerson = user.user_type === UserType.PERSON;

  const getProfileImage = () => {
    if (!user.user_logo) return '/images/porw.jpg';
    if (user.user_logo.startsWith('http')) return user.user_logo;
    return `${SUPABASE_STORAGE_URL}${user.user_logo}`;
  };

  return (
    <>
      <style jsx>{`
        /* Réduit l'espace global sous le titre principal */
        .profile-page {
          margin-top: -1.5rem; 
        }

        .profile-container-custom {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 2rem;
          background: #fff;
          border-radius: 16px;
          max-width: 1000px;
          margin: 0 auto 2rem auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }

        .avatar-main-wrapper {
          position: relative;
          margin-bottom: 1.2rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .avatar-circle-container {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 6px solid #8a2be2; 
          box-shadow: 0 12px 35px rgba(138, 43, 226, 0.4);
          overflow: hidden;
          position: relative;
          background: #f0f0f0;
        }

        .certification-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          z-index: 10;
          font-size: 2.2rem;
          background: white;
          border-radius: 50%;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          color: #00ce2c;
        }

        .user-type-tag {
          background: #f3e8ff;
          color: #8a2be2;
          padding: 6px 20px;
          border-radius: 30px;
          font-size: 0.9rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          border: 1px solid rgba(138, 43, 226, 0.2);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.2rem;
          width: 100%;
        }

        .info-card {
          padding: 1rem;
          background: #fafafa;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .info-card i {
          font-size: 1.3rem;
          color: #8a2be2;
          width: 30px;
          text-align: center;
        }

        .info-label {
          display: block;
          font-weight: 600;
          color: #999;
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        .info-value {
          color: #222;
          font-size: 1rem;
          font-weight: 500;
        }

        .description-box {
          grid-column: 1 / -1;
          background: #f9f7ff;
          padding: 1.5rem 2.5rem;
          border-radius: 15px;
          border-left: 8px solid #8a2be2;
          margin-top: 0.5rem;
        }

        .btn-edit-main {
          margin-top: 2rem;
          padding: 12px 35px;
          font-weight: 700;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
      `}</style>

      <div className="content-header">
        <div className="header-title">
          {/* Remplacement de Mon profil par Mon compte */}
          <h1>Mon compte</h1>
        </div>
      </div>

      <div className="profile-page">
        <div className="profile-container-custom">
          
          <div className="avatar-main-wrapper">
            <div className="avatar-circle-container">
              <Image 
                src={getProfileImage()} 
                alt="Photo de profil" 
                fill 
                style={{ objectFit: 'cover' }} 
                priority 
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            </div>

            {user.certified && (
              <div className="certification-badge">
                <i className="fas fa-check-circle" title="Compte Certifié"></i>
              </div>
            )}
          </div>

          <div className="user-type-tag">
             {isPerson ? 'Particulier' : 'Organisation'}
          </div>

          <div className="info-grid">
            <div className="info-card">
              <i className="fas fa-id-card"></i>
              <div>
                <span className="info-label">Nom</span>
                <span className="info-value">{user.user_lastname}</span>
              </div>
            </div>

            {isPerson && (
              <div className="info-card">
                <i className="fas fa-user"></i>
                <div>
                  <span className="info-label">Prénom</span>
                  <span className="info-value">{user.user_firstname || 'N/A'}</span>
                </div>
              </div>
            )}

            <div className="info-card">
              <i className="fas fa-envelope"></i>
              <div>
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
            </div>

            <div className="info-card">
              <i className="fas fa-phone-alt"></i>
              <div>
                <span className="info-label">Contact</span>
                <span className="info-value">{user.contact || 'Non renseigné'}</span>
              </div>
            </div>

            <div className="info-card">
              <i className="fas fa-layer-group"></i>
              <div>
                <span className="info-label">Domaine</span>
                <span className="info-value">{user.domain || 'N/A'}</span>
              </div>
            </div>

            {/* Affiche l'occupation UNIQUEMENT si c'est un particulier */}
            {isPerson && (
              <div className="info-card">
                <i className="fas fa-briefcase"></i>
                <div>
                  <span className="info-label">Occupation</span>
                  <span className="info-value">{user.occupation || 'N/A'}</span>
                </div>
              </div>
            )}

            <div className="info-card">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <span className="info-label">Localisation</span>
                <span className="info-value">{user.location || 'Non renseignée'}</span>
              </div>
            </div>

            <div className="info-card">
              <i className="fas fa-calendar-alt"></i>
              <div>
                <span className="info-label">Membre depuis le</span>
                <span className="info-value">
                  {new Date(user.registration_date_time).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="description-box">
              <span className="info-label"><i className="fas fa-info-circle"></i> Description</span>
              <p style={{fontStyle: 'italic', color: '#444', marginTop: '8px', fontSize: '1rem'}}>
                {user.description || "Aucune description disponible pour ce profil."}
              </p>
            </div>
          </div>

          <Link href="/follower/edit" className="btn btn-secondary btn-edit-main">
            <i className="fas fa-pen"></i>
            {t('account.editProfile')}
          </Link>
        </div>
      </div>
    </>
  );
}