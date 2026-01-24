import React from 'react';
import './css/style1.css';
import './css/feed.css';
import './css/profile.css';
import './css/follow-button.css';
import './css/edit-profile.css';

export default function FollowerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Masque le header/footer globaux (root layout) pour toutes les pages sous /follower */}
      <style>{`.navbar, .footer { display: none !important; } .main { margin: 0; }`}</style>
      {children}
    </>
  );
}
