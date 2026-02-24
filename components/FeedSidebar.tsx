"use client";
import React, { useEffect, useState } from 'react';
import { useTranslation } from './I18nProvider';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { userService } from '@/lib/services/user.service';

type Props = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export default function FeedSidebar({ isSidebarOpen, toggleSidebar }: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  // État pour stocker l'URL dynamique du profil
  const [profileUrl, setProfileUrl] = useState<string>('/dashboard/account');

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  useEffect(() => {
    const fetchUserForLink = async () => {
      try {
        const user = await userService.getCurrentUser();

        // CORRECTION ICI :
        // Le backend (PersonDTO.java) utilise userId (UUID).
        // Selon votre mapping JSON, cela peut être 'user_id' ou 'userId'.
        // On utilise 'any' temporairement sur 'user' pour contourner le check TS strict
        // si le type UserResponseDTO n'est pas encore mis à jour, 
        // mais l'idéal est de mettre à jour le type dans '../types/api'.
        const u = user as any;

        // On cherche l'ID dans les champs probables
        const identifier = u.user_id || u.userId || u.id;

        if (identifier) {
          setProfileUrl(`/dashboard/account/user/${identifier}`);
        }
      } catch (error) {
        console.error("Impossible de récupérer l'utilisateur pour la sidebar", error);
      }
    };

    fetchUserForLink();
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await userService.logout();
    router.push('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        gap: '15px'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image src="/images/logo.jpg" alt="Logo" width={35} height={35} style={{ minWidth: '35px' }} />
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="app-name">
            {t('sidebar.appName')}
          </motion.span>
        </div>

        <button
          className="mobile-close-btn"
          onClick={toggleSidebar}
          aria-label="Fermer le menu"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <nav className="main-nav" style={{ width: '100%' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {[
            { href: '/dashboard/feed', icon: 'fas fa-globe-americas', label: t('sidebar.feed') },
            { href: '/dashboard/follow', icon: 'fas fa-bell', label: t('sidebar.subscriptions') },
            { href: '/dashboard/project', icon: 'fas fa-folder-open', label: t('sidebar.projects') },
            { href: profileUrl, icon: 'fas fa-user-circle', label: t('sidebar.account') },
          ].map((item) => (
            <li key={item.href} className={isActive(item.href) ? 'active' : ''} style={{ width: '100%' }}>
              <Link href={item.href} onClick={() => { if (window.innerWidth <= 768) toggleSidebar(); }} style={{
                display: 'flex',
                justifyContent: 'flex-start',
                padding: '12px 15px'
              }}>
                <i className={`${item.icon} icon`} style={{ margin: 0, fontSize: '1.2rem' }} />
                <span style={{ marginLeft: '15px' }}>{item.label}</span>
              </Link>
            </li>
          ))}

          <li style={{ marginTop: '20px' }}>
            <a
              href="#"
              onClick={handleLogout}
              className="logout-link"
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                padding: '12px 15px',
                textDecoration: 'none',
                color: '#ff5252',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-sign-out-alt icon" style={{ margin: 0, fontSize: '1.2rem', color: '#ff5252' }} />
              <span style={{ marginLeft: '15px', fontWeight: 'bold' }}>{t('sidebar.logout')}</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside >
  );
}