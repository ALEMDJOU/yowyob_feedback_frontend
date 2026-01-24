"use client";
import React from 'react';
import { useTranslation } from './I18nProvider';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

type Props = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export default function FeedSidebar({ isCollapsed, toggleSidebar }: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  // ON FORCE LES VALEURS ICI POUR ÉCRASER LE CSS
  const collapsedWidth = "80px";
  const expandedWidth = "260px";

  return (
    <aside 
      className={`sidebar ${isCollapsed ? 'collapsed-mini' : ''}`} 
      style={{ 
        width: isCollapsed ? collapsedWidth : expandedWidth,
        minWidth: isCollapsed ? collapsedWidth : expandedWidth,
        transform: 'translateX(0)', // On annule le push hors écran du CSS
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
        
        {/* BOUTON DÉGRADÉ */}
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
            { href: '/dashboard/account', icon: 'fas fa-user-circle', label: t('sidebar.account') },
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
            <Link href="/" className="logout-link" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
              <i className="fas fa-sign-out-alt icon" style={{ margin: 0 }} /> 
              {!isCollapsed && <span>{t('sidebar.logout')}</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </aside >
  );
}