'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/components/I18nProvider';
import Link from 'next/link';
import { projectService, ProjectResponseDTO } from '@/lib/services/project.service';
import { userService } from '@/lib/services';

interface Project {
    id: string;
    name: string;
    description: string;
    avatar: string;
    membersCount: number;
    lastActivity: string;
    unread: number;
    role: 'admin' | 'invite';
    creatorUsername: string; // Username du créateur du groupe
}

const mockProjects: Project[] = [
    {
        id: "p1-bd-group",
        name: "Groupe BD",
        description: "Projet de base de données collaborative pour le suivi des tâches.",
        avatar: "https://i.ibb.co/6P8N9zR/company-logo.png",
        membersCount: 12,
        lastActivity: "Actif il y a 10 min",
        unread: 2,
        role: 'admin',
        creatorUsername: 'techinnov'
    },
    {
        id: "p2-kadea-stage",
        name: "Stage Kadea",
        description: "Accompagnement et suivi du stage chez Kadea Tech.",
        avatar: "https://i.ibb.co/Qf983vG/avatar-placeholder.png",
        membersCount: 5,
        lastActivity: "Actif hier",
        unread: 0,
        role: 'invite',
        creatorUsername: 'globalcorp'
    },
    {
        id: "p3-react-proj",
        name: "Projet React",
        description: "Développement d'une application React moderne avec TypeScript.",
        avatar: "https://i.ibb.co/6P8N9zR/company-logo.png",
        membersCount: 8,
        lastActivity: "Actif lundi",
        unread: 5,
        role: 'admin',
        creatorUsername: 'techinnov'
    },
    {
        id: "p4-support",
        name: "Support Yowyob",
        description: "Équipe de support client et assistance technique.",
        avatar: "https://i.ibb.co/Qf983vG/avatar-placeholder.png",
        membersCount: 15,
        lastActivity: "Actif le 15/12",
        unread: 0,
        role: 'invite',
        creatorUsername: 'designstudio'
    },
];

export default function ProjectsPage() {
    const { t } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
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

    // Charger les projets (créés + rejoints) pour l'utilisateur connecté
    useEffect(() => {
        const load = async () => {
            try {
                const [me, list] = await Promise.all([
                    userService.getCurrentUser(),
                    projectService.getUserProjects(),
                ]);
                const mapped: Project[] = list.map((p: ProjectResponseDTO) => ({
                    id: p.project_name,
                    name: p.project_name,
                    description: p.description || '',
                    avatar: p.project_logo || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png',
                    membersCount: p.number_of_members ?? 0,
                    lastActivity: new Date(p.creation_date_time).toLocaleDateString(),
                    unread: 0,
                    role: p.creator_id === (me as any).user_id ? 'admin' : 'invite',
                    creatorUsername: ''
                }));
                setProjects(mapped);
            } catch (e) {
                console.error("Failed to load user projects", e);
                setProjects([]); // Ensure we show nothing if not authorized or error
            }
        };
        load();
    }, []);

    return (
        <>
            <link rel="stylesheet" href="/projects.css" />
            <link rel="stylesheet" href="/feed.css" />

            <header className="content-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <i className="fas fa-layer-group" style={{ color: '#7C3AED', fontSize: '1.5rem' }}></i>
                    <h1 style={{ color: '#1F2937', fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>{t('sidebar.projects')}</h1>
                </div>

                <div style={{ position: 'relative' }} ref={menuRef}>
                    {/* BOUTON MODIFIÉ ICI */}
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        style={{
                            backgroundColor: '#F3F4F6',
                            border: '1.5px solid #000000', // Bordure noire plus foncée
                            color: '#000000', // Plus de contraste
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%', // Cercle parfait
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: 400,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#E5E7EB';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#F3F4F6';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <span style={{ marginTop: '-2px' }}>+</span>
                    </button>

                    {showMenu && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '52px',
                            backgroundColor: 'white',
                            minWidth: '220px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            borderRadius: '10px',
                            padding: '8px 0',
                            zIndex: 100,
                            border: '1px solid #E5E7EB',
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <Link
                                href="/dashboard/project/create"
                                style={{
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    color: '#1F2937',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: 500
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <i className="fas fa-plus-circle" style={{ marginRight: '12px', color: '#7C3AED', width: '16px', textAlign: 'center' }}></i>
                                Créer un projet
                            </Link>
                            <Link
                                href="/dashboard/project/join"
                                style={{
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    color: '#1F2937',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: 500
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <i className="fas fa-user-plus" style={{ marginRight: '12px', color: '#7C3AED', width: '16px', textAlign: 'center' }}></i>
                                Rejoindre un projet
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            <div className="project-list" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
                padding: '8px'
            }}>
                {projects.map((project) => (
                    <Link key={project.id} href={`/dashboard/project/${project.id}`} style={{ textDecoration: 'none' }}>
                        <div className="project-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                            border: '1px solid #E5E7EB',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            position: 'relative'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Badge admin/invite */}
                            {project.role === 'admin' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    backgroundColor: '#7C3AED',
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase'
                                }}>
                                    Admin
                                </div>
                            )}

                            {/* Header avec avatar et nom */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <img
                                    src={project.avatar}
                                    alt={project.name}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '12px',
                                        objectFit: 'cover',
                                        border: '2px solid #E5E7EB'
                                    }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        margin: 0,
                                        color: '#1F2937',
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {project.name}
                                    </h3>
                                    <p style={{
                                        margin: '4px 0 0 0',
                                        color: '#6B7280',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <i className="fas fa-users" style={{ fontSize: '0.8rem' }}></i>
                                        {project.membersCount} membres
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <p style={{
                                color: '#6B7280',
                                fontSize: '0.9rem',
                                margin: 0,
                                lineHeight: 1.5,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                textOverflow: 'ellipsis'
                            }}>
                                {project.description}
                            </p>

                            {/* Footer avec activité et notifications */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '12px',
                                borderTop: '1px solid #F3F4F6'
                            }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    color: '#9CA3AF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <i className="far fa-clock"></i>
                                    {project.lastActivity}
                                </span>

                                {project.unread > 0 && (
                                    <span style={{
                                        background: '#EF4444',
                                        color: 'white',
                                        minWidth: '24px',
                                        height: '24px',
                                        padding: '0 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {project.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}