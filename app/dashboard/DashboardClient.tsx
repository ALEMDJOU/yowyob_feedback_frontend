"use client";

import React, { useState, useEffect } from 'react';
import FeedSidebar from '@/components/FeedSidebar';
import MagicPageEnhancer from '@/components/MagicPageEnhancer';
import PageTransition from '@/components/PageTransition';
import '../feed.css';

export default function DashboardClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <MagicPageEnhancer>
            <div className={`dashboard-container ${isSidebarOpen ? 'mobile-nav-active' : ''}`}>
                <FeedSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                {/* Mobile Overlay Backdrop */}
                {isSidebarOpen && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="main-content">
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