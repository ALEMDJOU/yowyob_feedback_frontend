"use client";

import React, { useState, useEffect } from 'react';
import FeedSidebar from '@/components/FeedSidebar';
import MagicPageEnhancer from '@/components/MagicPageEnhancer';
import PageTransition from '@/components/PageTransition';
import '../feed.css';

export default function DashboardClient({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // On mobile, default to collapsed (hidden). On desktop, default to open.
            if (mobile) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <MagicPageEnhancer>
            <div className={`dashboard-container ${isMobile ? 'mobile-view' : ''}`}>
                <FeedSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

                {/* Mobile Overlay Backdrop */}
                {isMobile && !isCollapsed && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setIsCollapsed(true)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 99,
                            backdropFilter: 'blur(2px)'
                        }}
                    />
                )}

                <main className="main-content" style={{
                    marginLeft: isMobile ? '0' : (isCollapsed ? '80px' : '250px'),
                    transition: 'margin 0.3s ease',
                    width: isMobile ? '100%' : 'auto' // Important for causing reflow
                }}>
                    <div className="mobile-dashboard-header">
                        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Menu">
                            <i className="fas fa-bars"></i>
                        </button>
                        <span className="app-name-mobile">Yowyob</span>
                    </div>

                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>
        </MagicPageEnhancer>
    );
}