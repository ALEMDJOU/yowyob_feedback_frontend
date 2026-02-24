'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/components/I18nProvider';
import Link from 'next/link';
import { projectService, ProjectResponseDTO } from '@/lib/services/project.service';
import { userService } from '@/lib/services';
import { useToast } from '@/components/ToastProvider';
import ConfirmationModal from '@/components/ConfirmationModal';
import { motion } from 'framer-motion';

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
    creatorId: string; // ID du créateur pour quitter le projet
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
        creatorUsername: 'techinnov',
        creatorId: 'mock-id-1'
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
        creatorUsername: 'globalcorp',
        creatorId: 'mock-id-2'
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
        creatorUsername: 'techinnov',
        creatorId: 'mock-id-3'
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
        creatorUsername: 'designstudio',
        creatorId: 'mock-id-4'
    },
];

export default function ProjectsPage() {
    const { t } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    const [activeProjectMenu, setActiveProjectMenu] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [editData, setEditData] = useState({ name: '', description: '' });
    const [isPseudoModalOpen, setIsPseudoModalOpen] = useState(false);
    const [newPseudo, setNewPseudo] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { showToast } = useToast();
    const menuRef = useRef<HTMLDivElement>(null);
    const projectMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
            if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
                setActiveProjectMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadProjects = async () => {
        try {
            const [me, list] = await Promise.all([
                userService.getCurrentUser(),
                projectService.getUserProjects(),
            ]);
            setCurrentUser(me);
            const mapped: Project[] = list.map((p: ProjectResponseDTO) => ({
                id: p.project_name,
                name: p.project_name,
                description: p.description || '',
                avatar: p.project_logo || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png',
                membersCount: p.number_of_members ?? 0,
                lastActivity: new Date(p.creation_date_time).toLocaleDateString(),
                unread: 0,
                role: p.creator_id === (me as any).user_id ? 'admin' : 'invite',
                creatorUsername: '',
                creatorId: p.creator_id
            }));
            setProjects(mapped);
        } catch (e) {
            console.error("Failed to load user projects", e);
            setProjects([]);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleDeleteProject = async () => {
        if (!selectedProject) return;
        setIsActionLoading(true);
        try {
            await projectService.deleteProject(selectedProject.name);
            showToast("Projet supprimé avec succès", "success");
            setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            showToast(error.message || "Erreur lors de la suppression", "error");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleLeaveProject = async () => {
        if (!selectedProject) return;
        setIsActionLoading(true);
        try {
            await projectService.leaveProject(selectedProject.name, selectedProject.creatorId);
            showToast("Vous avez quitté le projet", "success");
            setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
            setIsLeaveDialogOpen(false);
        } catch (error: any) {
            showToast(error.message || "Erreur lors de l'action", "error");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUpdateProject = async () => {
        if (!selectedProject) return;
        setIsActionLoading(true);
        try {
            await projectService.updateProject(selectedProject.name, {
                project_name: editData.name,
                description: editData.description
            });
            showToast("Projet mis à jour", "success");
            loadProjects();
            setIsEditModalOpen(false);
        } catch (error: any) {
            showToast(error.message || "Erreur lors de la mise à jour", "error");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUpdatePseudo = async () => {
        if (!selectedProject || !currentUser) return;
        setIsActionLoading(true);
        try {
            // 1. Récupérer les membres pour trouver le memberId de l'utilisateur courant
            const members = await projectService.getProjectMembers(selectedProject.name);
            const myMember = members.find(m => m.user_id === currentUser.user_id);

            if (!myMember) {
                throw new Error("Impossible de récupérer vos informations de membre dans ce projet.");
            }

            // 2. Mettre à jour le pseudo
            await projectService.updateMemberPseudo(selectedProject.name, myMember.member_id, newPseudo);
            showToast("Pseudo mis à jour avec succès", "success");
            setIsPseudoModalOpen(false);
            setNewPseudo('');
        } catch (error: any) {
            showToast(error.message || "Erreur lors de la mise à jour du pseudo", "error");
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <>
            <link rel="stylesheet" href="/projects.css" />
            <link rel="stylesheet" href="/feed.css" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', textAlign: 'center'
                }}
            >
                <div style={{ position: 'relative', marginBottom: '25px' }}>
                    <div
                        style={{
                            background: 'white', border: '3px solid #7C3AED', borderRadius: '50%', padding: '8px',
                            boxShadow: '0 20px 40px rgba(124, 58, 237, 0.2)',
                            width: '140px', height: '140px', overflow: 'hidden', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1
                        }}
                    >
                        <i className="fas fa-layer-group" style={{ fontSize: '4rem', color: '#7C3AED' }}></i>
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{
                            position: 'absolute', top: '-10px', left: '-10px', right: '-10px', bottom: '-10px',
                            border: '2px solid #7C3AED', borderRadius: '50%', zIndex: 0
                        }}
                    />
                </div>

                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#111827',
                    letterSpacing: '-0.025em',
                    marginBottom: '20px'
                }}>
                    {t('sidebar.projects')}
                </h1>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link
                        href="/dashboard/project/create"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 24px',
                            backgroundColor: '#7C3AED',
                            color: 'white',
                            borderRadius: '12px',
                            fontWeight: 600,
                            boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.2), 0 2px 4px -1px rgba(124, 58, 237, 0.1)',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(124, 58, 237, 0.3), 0 4px 6px -2px rgba(124, 58, 237, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(124, 58, 237, 0.2), 0 2px 4px -1px rgba(124, 58, 237, 0.1)';
                        }}
                    >
                        <i className="fas fa-plus-circle" style={{ marginRight: '8px', fontSize: '1.1rem' }}></i>
                        Créer un projet
                    </Link>

                    <Link
                        href="/dashboard/project/join"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 24px',
                            backgroundColor: 'white',
                            color: '#111827',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            fontWeight: 600,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <i className="fas fa-user-plus" style={{ marginRight: '8px', color: '#7C3AED', fontSize: '1.1rem' }}></i>
                        Rejoindre un projet
                    </Link>
                </div>
            </motion.div>

            <div className="project-list" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '20px',
                padding: '8px'
            }}>
                <ConfirmationModal
                    isOpen={isDeleteDialogOpen}
                    title="Supprimer le projet"
                    message={`Êtes-vous sûr de vouloir supprimer définitivement le projet "${selectedProject?.name}" ?`}
                    onConfirm={handleDeleteProject}
                    onCancel={() => setIsDeleteDialogOpen(false)}
                    confirmText={isActionLoading ? "Suppression..." : "Oui, supprimer"}
                    cancelText="Annuler"
                    isDangerous={true}
                />

                <ConfirmationModal
                    isOpen={isLeaveDialogOpen}
                    title="Quitter le projet"
                    message={`Voulez-vous vraiment quitter le projet "${selectedProject?.name}" ?`}
                    onConfirm={handleLeaveProject}
                    onCancel={() => setIsLeaveDialogOpen(false)}
                    confirmText={isActionLoading ? "Départ..." : "Oui, quitter"}
                    cancelText="Annuler"
                    isDangerous={true}
                />

                {/* Modal d'édition simplifié */}
                {isEditModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white', padding: '30px', borderRadius: '16px',
                            width: '400px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Modifier le projet</h2>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 600 }}>Nom du projet</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                                />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
                                <textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', minHeight: '80px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white' }}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleUpdateProject}
                                    disabled={isActionLoading}
                                    style={{
                                        padding: '10px 16px', borderRadius: '8px', border: 'none',
                                        background: '#7C3AED', color: 'white', fontWeight: 600,
                                        opacity: isActionLoading ? 0.7 : 1
                                    }}
                                >
                                    {isActionLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Changement de Pseudo */}
                {isPseudoModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white', padding: '30px', borderRadius: '16px',
                            width: '400px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Changer mon pseudo</h2>
                            <p style={{ marginBottom: '20px', color: '#6B7280', fontSize: '0.9rem' }}>
                                Ce pseudo sera visible par les autres membres du projet <strong>{selectedProject?.name}</strong>.
                            </p>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 600 }}>Nouveau pseudo</label>
                                <input
                                    type="text"
                                    value={newPseudo}
                                    onChange={(e) => setNewPseudo(e.target.value)}
                                    placeholder="Entrez votre nouveau pseudo"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setIsPseudoModalOpen(false)}
                                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white' }}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleUpdatePseudo}
                                    disabled={isActionLoading || !newPseudo.trim()}
                                    style={{
                                        padding: '10px 16px', borderRadius: '8px', border: 'none',
                                        background: '#7C3AED', color: 'white', fontWeight: 600,
                                        opacity: isActionLoading || !newPseudo.trim() ? 0.7 : 1
                                    }}
                                >
                                    {isActionLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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

                            {/* Menu 3 points verticaux */}
                            <div
                                style={{ position: 'absolute', top: '40px', right: '12px', zIndex: 10 }}
                                ref={activeProjectMenu === project.id ? projectMenuRef : null}
                            >
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setActiveProjectMenu(activeProjectMenu === project.id ? null : project.id);
                                    }}
                                    style={{
                                        background: 'transparent', border: 'none', color: '#6B7280',
                                        cursor: 'pointer', padding: '6px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>

                                {activeProjectMenu === project.id && (
                                    <div style={{
                                        position: 'absolute', right: 0, top: '100%',
                                        backgroundColor: 'white', borderRadius: '8px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid #E5E7EB', minWidth: '160px',
                                        padding: '4px', zIndex: 20
                                    }}>
                                        {project.role === 'admin' ? (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        setSelectedProject(project);
                                                        setEditData({ name: project.name, description: project.description });
                                                        setIsEditModalOpen(true);
                                                        setActiveProjectMenu(null);
                                                    }}
                                                    style={{
                                                        width: '100%', textAlign: 'left', padding: '10px 12px',
                                                        borderRadius: '6px', border: 'none', background: 'transparent',
                                                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                                        fontSize: '0.9rem', color: '#1F2937'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <i className="fas fa-edit" style={{ color: '#4B5563' }}></i> Modifier
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        setSelectedProject(project);
                                                        setIsDeleteDialogOpen(true);
                                                        setActiveProjectMenu(null);
                                                    }}
                                                    style={{
                                                        width: '100%', textAlign: 'left', padding: '10px 12px',
                                                        borderRadius: '6px', border: 'none', background: 'transparent',
                                                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                                        fontSize: '0.9rem', color: '#EF4444'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <i className="fas fa-trash-alt"></i> Supprimer
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        setSelectedProject(project);
                                                        setNewPseudo('');
                                                        setIsPseudoModalOpen(true);
                                                        setActiveProjectMenu(null);
                                                    }}
                                                    style={{
                                                        width: '100%', textAlign: 'left', padding: '10px 12px',
                                                        borderRadius: '6px', border: 'none', background: 'transparent',
                                                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                                        fontSize: '0.9rem', color: '#1F2937'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <i className="fas fa-user-edit" style={{ color: '#4B5563' }}></i> Changer mon pseudo
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        setSelectedProject(project);
                                                        setNewPseudo('');
                                                        setIsPseudoModalOpen(true);
                                                        setActiveProjectMenu(null);
                                                    }}
                                                    style={{
                                                        width: '100%', textAlign: 'left', padding: '10px 12px',
                                                        borderRadius: '6px', border: 'none', background: 'transparent',
                                                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                                        fontSize: '0.9rem', color: '#1F2937'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <i className="fas fa-user-edit" style={{ color: '#4B5563' }}></i> Changer mon pseudo
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        setSelectedProject(project);
                                                        setIsLeaveDialogOpen(true);
                                                        setActiveProjectMenu(null);
                                                    }}
                                                    style={{
                                                        width: '100%', textAlign: 'left', padding: '10px 12px',
                                                        borderRadius: '6px', border: 'none', background: 'transparent',
                                                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                                        fontSize: '0.9rem', color: '#EF4444'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <i className="fas fa-sign-out-alt"></i> Quitter le groupe
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

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
