"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
    children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{
                    opacity: 0,
                    x: 100,
                    filter: 'blur(10px)',
                    scale: 0.95
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                    filter: 'blur(0px)',
                    scale: 1
                }}
                exit={{
                    opacity: 0,
                    x: -100,
                    filter: 'blur(10px)',
                    scale: 0.95
                }}
                transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1], // Custom easing for smooth morphing
                }}
                style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '100vh'
                }}
            >
                {/* Gradient overlay effect */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.1, 0] }}
                    transition={{ duration: 0.6 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(106, 27, 154, 0.1) 0%, rgba(142, 36, 170, 0.1) 100%)',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}
                />
                <div style={{ position: 'relative', zIndex: 2 }}>
                    {children}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
