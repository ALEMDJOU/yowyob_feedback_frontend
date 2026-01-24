"use client";

import React, { useState, useEffect } from 'react';
import FeedSidebar from '@/components/FeedSidebar';
import MagicPageEnhancer from '@/components/MagicPageEnhancer';
import '../feed.css';

export default function DashboardClient({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
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
            <div className="dashboard-container">
                {/* Ta sidebar contient maintenant l'unique bouton de contrôle */}
                <FeedSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

                <main className="main-content" style={{ marginLeft: isCollapsed ? '80px' : '260px', transition: 'margin 0.3s ease' }}>
                    <div className="mobile-dashboard-header">
                        <span className="app-name-mobile">Yowyob</span>
                    </div>

                    {/* Le bouton "desktop-toggle" a été supprimé pour épurer l'interface */}
                    
                    {children}
                </main>
            </div>
        </MagicPageEnhancer>
    );
}