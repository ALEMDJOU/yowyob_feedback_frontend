import React from 'react';
import DashboardClient from './DashboardClient';

export const metadata = {
    title: 'Dashboard - Yowyob Feedback',
    description: 'Gérez vos feedbacks, projets et votre compte.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardClient>
            {children}
        </DashboardClient>
    );
}
