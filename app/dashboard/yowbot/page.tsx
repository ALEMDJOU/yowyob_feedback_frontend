
'use client';

import React from 'react';
import Link from 'next/link';

export default function YowbotPage() {
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Yowbot AI Assistant</h1>
            <p>Bienvenue sur l'interface Yowbot. Comment puis-je vous aider ?</p>
            <Link href="/feed" className="btn btn-primary" style={{ marginTop: '20px' }}>
                Retour au fil d'actualité
            </Link>
        </div>
    );
}
