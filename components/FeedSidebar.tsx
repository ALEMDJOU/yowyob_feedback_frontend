"use client";
import React, { useEffect, useState } from 'react';
import { useTranslation } from './I18nProvider';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { userService } from '@/lib/services/user.service';

type Props = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export default function FeedSidebar({ isCollapsed, toggleSidebar }: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  // État pour stocker l'URL dynamique du profil
  const [profileUrl, setProfileUrl] = useState<string>('/dashboard/account');

  const collapsedWidth = "80px";
  const expandedWidth = "260px";

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
    router.push('/auth/login');
  };

  return (
    <aside 
      className={`sidebar ${isCollapsed ? 'collapsed-mini' : ''}`} 
      style={{ 
        width: isCollapsed ? collapsedWidth : expandedWidth,
        minWidth: isCollapsed ? collapsedWidth : expandedWidth,
        transform: 'translateX(0)',
        padding: isCollapsed ? '20px 0' : '20px',
        transition: 'width 0.3s ease, padding 0.3s ease'
      }}
    >
      <div className="sidebar-header" style={{ 
        display: 'flex', 
        flexDirection: isCollapsed ? 'column' : 'row',
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'space-between',
        marginBottom: '30px',
        gap: isCollapsed ? '15px' : '0'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image src="/images/logo.jpg" alt="Logo" width={35} height={35} style={{ minWidth: '35px' }} />
          {!isCollapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="app-name">
              {t('sidebar.appName')}
            </motion.span>
          )}
        </div>
        
        <motion.button 
          onClick={toggleSidebar}
          whileTap={{ scale: 0.9 }}
          style={{ 
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #E1BEE7 100%)', 
            border: '1px solid #D1C4E9', 
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            color: '#6A1B9A'
          }}
        >
          <motion.svg 
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </motion.svg>
        </motion.button>
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
              <Link href={item.href} style={{ 
                display: 'flex', 
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: '12px 15px'
              }}>
                <i className={`${item.icon} icon`} style={{ margin: 0, fontSize: '1.2rem' }} /> 
                {!isCollapsed && <span style={{ marginLeft: '15px' }}>{item.label}</span>}
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
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: '12px 15px',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-sign-out-alt icon" style={{ margin: 0, fontSize: '1.2rem' }} /> 
              {!isCollapsed && <span style={{ marginLeft: '15px' }}>{t('sidebar.logout')}</span>}
            </a>
          </li>
        </ul>
      </nav>
    </aside >
  );
}