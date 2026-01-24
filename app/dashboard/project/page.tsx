
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/components/I18nProvider';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    lastMsg: string;
    lastUser: string;
    time: string;
    unread: number;
    color: string;
    role: 'admin' | 'invite';
    description?: string;
}

const mockProjects: Project[] = [
    { id: "p1-bd-group", name: "Groupe BD", lastMsg: "C'est validé pour demain ?", lastUser: "Alice", time: "10:30", unread: 2, color: "#6A1B9A", role: 'admin' },
    { id: "p2-kadea-stage", name: "Stage Kadea", lastMsg: "J'ai envoyé le rapport.", lastUser: "Bob", time: "Hier", unread: 0, color: "#8E24AA", role: 'invite' },
    { id: "p3-react-proj", name: "Projet React", lastMsg: "Nouveau composant dispo", lastUser: "Charlie", time: "Lun", unread: 5, color: "#4A00B7", role: 'admin' },
    { id: "p4-support", name: "Support Yowyob", lastMsg: "Ticket résolu ✅", lastUser: "Support", time: "15/12", unread: 0, color: "#2C3E50", role: 'invite' },
];

export default function ProjectsPage() {
    const { t } = useTranslation();
    const [projects] = useState<Project[]>(mockProjects);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <header className="content-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                borderBottom: '1px solid #eee',
                paddingBottom: '15px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{ color: '#6A1B9A', fontSize: '1.8rem', margin: 0 }}>{t('sidebar.projects')}</h1>
                </div>

                <div style={{ position: 'relative' }} ref={menuRef}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowMenu(!showMenu)}
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                        }}
                    >
                        +
                    </button>

                    {showMenu && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '60px',
                            backgroundColor: 'white',
                            minWidth: '220px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            borderRadius: '8px',
                            padding: '8px 0',
                            zIndex: 100,
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <Link
                                href="/project/join"
                                style={{
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    color: '#2C3E50',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: 'normal'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f0fa'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <i className="fas fa-user-plus" style={{ marginRight: '12px', color: '#6A1B9A', width: '16px', textAlign: 'center' }}></i>
                                Rejoindre un projet
                            </Link>
                            <button
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    textAlign: 'left',
                                    background: 'none',
                                    border: 'none',
                                    padding: '12px 20px',
                                    color: '#2C3E50',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: 'normal'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f0fa'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                onClick={() => setShowMenu(false)}
                            >
                                <i className="fas fa-plus-circle" style={{ marginRight: '12px', color: '#6A1B9A', width: '16px', textAlign: 'center' }}></i>
                                Créer un projet
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="project-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px' }}>
                {projects.map((project) => (
                    <Link key={project.id} href={`/dashboard/project/${project.id}`} style={{ textDecoration: 'none' }}>
                        <div className="project-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                            borderLeft: `5px solid ${project.color}`,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: 'auto'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h3 style={{ margin: 0, color: '#2C3E50', fontSize: '1.1rem' }}>{project.name}</h3>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}><i className="far fa-clock"></i> {project.time}</span>
                                </div>
                                <p style={{ color: '#555', fontSize: '0.95rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <strong>{project.lastUser}:</strong> {project.lastMsg}
                                </p>
                            </div>

                            {project.unread > 0 && (
                                <div style={{ marginLeft: '15px' }}>
                                    <span style={{
                                        background: '#ef4444',
                                        color: 'white',
                                        minWidth: '24px',
                                        height: '24px',
                                        padding: '0 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {project.unread}
                                    </span>
                                </div>
                            )}

                            <div style={{ marginLeft: '15px', color: '#ccc' }}>
                                <i className="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
