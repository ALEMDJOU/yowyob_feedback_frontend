"use client";

import React, { useState, useEffect } from 'react';
import FeedSidebar from '@/components/FeedSidebar';
import MagicPageEnhancer from '@/components/MagicPageEnhancer';
import PageTransition from '@/components/PageTransition';
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
                <FeedSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

                <main className="main-content" style={{ marginLeft: isCollapsed ? '80px' : '260px', transition: 'margin 0.3s ease' }}>
                    <div className="mobile-dashboard-header">
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