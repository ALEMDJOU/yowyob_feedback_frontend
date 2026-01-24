// components/MagicPageEnhancer.tsx
'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';


// Configuration des particules (adaptée au thème)
const particlesConfig: any = {
    fpsLimit: 120,
    interactivity: {
        events: { onHover: { enable: true, mode: "repulse" }, resize: true },
        modes: { repulse: { distance: 100, duration: 0.4 } },
    },
    particles: {
        color: { value: "#8E24AA" },
        links: { color: "#6A1B9A", distance: 150, enable: true, opacity: 0.5, width: 1 },
        move: { enable: true, outModes: { default: "bounce" }, speed: 1 },
        number: { density: { enable: true, area: 800 }, value: 80 },
        opacity: { value: 0.5 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 5 } },
    },
    detectRetina: true,
};

export default function MagicPageEnhancer({ children }: { children: React.ReactNode }) {
    const [init, setInit] = React.useState(false);

    // Initialisation des particules
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            // Engine already initialized
        }).then(() => {
            setInit(true);
        });
    }, []);

    useEffect(() => {
        // Ajoute la classe 'magic-glow' aux titres h1, h2, h3
        const titles = document.querySelectorAll('h1, h2, h3');
        titles.forEach(title => title.classList.add('magic-glow'));

        // Ajoute les effets de survol aux boutons
        const buttons = document.querySelectorAll('a.btn');
        const handleMouseEnter = (e: Event) => (e.target as HTMLElement).classList.add('btn-hover-effect');
        const handleMouseLeave = (e: Event) => (e.target as HTMLElement).classList.remove('btn-hover-effect');

        buttons.forEach(button => {
            button.addEventListener('mouseenter', handleMouseEnter);
            button.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            titles.forEach(title => title.classList.remove('magic-glow'));
            buttons.forEach(button => {
                button.removeEventListener('mouseenter', handleMouseEnter);
                button.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, []);

    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Particules modernes */}
            {init && (
                <Particles
                    id="tsparticles"
                    options={particlesConfig}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
                />
            )}

            {/* Animation d'entrée globale avec Framer Motion */}
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}