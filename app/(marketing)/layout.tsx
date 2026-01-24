
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import React from 'react';

export const metadata = {
    title: 'Yowyob Feedback - La plateforme ultime',
    description: 'La plateforme ultime pour émettre et consulter des feedbacks sur les stages et formations.',
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main>
                {children}
            </main>
            <Footer />
        </>
    );
}
