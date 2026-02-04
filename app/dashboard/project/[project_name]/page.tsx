'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FeedbackCard, { FeedbackData } from '@/components/FeedbackCard';
import { projectService } from '@/lib/services/project.service';
import { feedbackService } from '@/lib/services/feedback.service';
import { userService } from '@/lib/services/user.service';
import { fileService } from '@/lib/services/file.service';
import { ProjectDetailResponseDTO, UserResponseDTO, MemberResponseDTO } from '@/lib/types/api';

const MOCK_PROJECT_ID = "mock-id";

const mockProject: ProjectDetailResponseDTO = {
    project_id: MOCK_PROJECT_ID,
    project_name: "Projet de démo",
    description: "Ceci est une description de projet de démo. Le backend n'est probablement pas connecté.",
    code: "MOCK-CODE",
    project_logo: "https://i.ibb.co/6P8N9zR/company-logo.png",
    number_of_members: 42,
    creation_date_time: new Date().toISOString(),
    creator_id: "mock-creator-id",
    creator_name: "Admin de démo",
    members: [
        { member_id: "m1", member_pseudo: "Henri F.", user_id: "u1", project_id: MOCK_PROJECT_ID },
        { member_id: "m2", member_pseudo: "Carole B.", user_id: "u2", project_id: MOCK_PROJECT_ID },
    ]
};

const mockAnonymousFeedbacks: FeedbackData[] = [
    {
        id: 'anon-1',
        author: { name: 'Membre Anonyme', avatar: 'https://i.pravatar.cc/150?u=anon1' },
        createdAt: new Date().toISOString(),
        content: "Ceci est un feedback de démonstration. Le contenu réel sera chargé lorsque le backend sera connecté.",
        likes: 10,
        liked: false,
        comments: [],
        project: { name: "Projet de démo", id: MOCK_PROJECT_ID },
    },
    {
        id: 'anon-2',
        author: { name: 'Membre Anonyme', avatar: 'https://i.pravatar.cc/150?u=anon2' },
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        content: "Un autre exemple de feedback pour montrer à quoi ressemble la liste.",
        likes: 25,
        liked: true,
        comments: [],
        project: { name: "Projet de démo", id: MOCK_PROJECT_ID },
    }
]

export default function ProjectDetailPage() {
    const params = useParams();
    const projectName = params?.project_name ? decodeURIComponent(params.project_name as string) : '';

    const [project, setProject] = useState<ProjectDetailResponseDTO | null>(null);
    const [currentUser, setCurrentUser] = useState<UserResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false);
    const [globalMembers, setGlobalMembers] = useState<MemberResponseDTO[]>([]);
    const projectInfoRef = useRef<HTMLDivElement>(null);

    // New feedback state
    const [newFeedbackContent, setNewFeedbackContent] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch user and project details
    useEffect(() => {
        const fetchData = async () => {
            if (!projectName) return;
            setLoading(true);
            setError(null);
            try {
                // 1. Get current user first
                const userData = await userService.getCurrentUser().catch(() => null);
                setCurrentUser(userData);

                // 2. Resolve project details
                let projectData: ProjectDetailResponseDTO | null = null;
                try {
                    projectData = await projectService.getProjectDetailsByName(projectName);
                } catch (err: any) {
                    console.error("Error fetching project details by name:", err);
                    // Fallback: check user projects list
                    const userProjects = await projectService.getUserProjects().catch(() => []);
                    const found = userProjects.find(p => p.project_name === projectName);

                    if (found) {
                        projectData = { ...found, members: [] };
                    } else if (projectName === "Projet de démo") {
                        projectData = mockProject;
                    } else {
                        // Re-throw if it's a real error and not just 404/403
                        throw err;
                    }
                }

                if (!projectData) {
                    throw new Error("Projet introuvable.");
                }

                // 3. Attempt to fetch members for display and pseudo identification
                if (projectData.project_id !== MOCK_PROJECT_ID) {
                    try {
                        const members = await userService.getProjectMembers(projectName);
                        setGlobalMembers(members);
                    } catch (memberErr) {
                        console.debug("Could not fetch project members (likely restricted):", memberErr);
                    }
                } else {
                    setGlobalMembers([]);
                }

                setProject(projectData);
            } catch (err: any) {
                console.error("Failed to fetch project details.", err);
                const msg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectName]);

    // Fetch feedbacks
    const fetchFeedbacks = async () => {
        if (!project?.project_id) return;

        if (project.project_id === MOCK_PROJECT_ID) {
            setFeedbacks(mockAnonymousFeedbacks);
            return;
        }

        try {
            const feedbackResponses = await feedbackService.getFeedbacksByProjectId(project.project_id);
            const transformedFeedbacks = feedbackResponses.map((fb): FeedbackData => ({
                id: fb.feedback_id,
                author: {
                    name: fb.member_pseudo || 'Membre Anonyme',
                    avatar: project.project_logo || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png'
                },
                createdAt: fb.feedback_date_time,
                content: fb.content,
                likes: fb.number_of_likes,
                liked: false,
                comments: [],
                project: { name: fb.project_name, id: fb.target_project_id },
                attachments: fb.attachments
            }));
            setFeedbacks(transformedFeedbacks);
        } catch (e) {
            console.error("Failed to fetch feedbacks", e);
            setFeedbacks([]);
        }
    };

    useEffect(() => {
        if (project) fetchFeedbacks();
    }, [project]);

    // Close project info dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (projectInfoRef.current && !projectInfoRef.current.contains(event.target as Node)) {
                setIsProjectInfoOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachedFiles(Array.from(e.target.files));
        }
    };

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFeedbackContent.trim() || !project) return;

        setIsSubmitting(true);
        try {
            // 1. Identify the actual member_pseudo for this project
            const currentUserId = currentUser?.user_id;
            let memberPseudo = '';

            // Strategy A: Find in loaded members list (only works for creators or if members are public)
            const memberRecord = globalMembers.find(m => m.user_id === currentUserId) ||
                project.members?.find(m => m.user_id === currentUserId);

            if (memberRecord) {
                memberPseudo = memberRecord.member_pseudo;
                console.log("Found member pseudo from project members list:", memberPseudo);
            }
            // Strategy B: If current user is the creator, reconstruct their pseudo
            else if (currentUserId === project.creator_id && currentUser) {
                memberPseudo = currentUser.user_firstname
                    ? `${currentUser.user_firstname} ${currentUser.user_lastname}`.trim()
                    : currentUser.user_lastname;
                console.log("Reconstructed creator pseudo:", memberPseudo);
            }
            // Strategy C: Look in local cache (set when joining)
            else if (typeof window !== 'undefined' && currentUserId && project.project_id) {
                const cached = localStorage.getItem(`yy_pseudo_${project.project_id}_${currentUserId}`);
                if (cached) {
                    memberPseudo = cached;
                    console.log("Retrieved member pseudo from local cache:", memberPseudo);
                }
            }

            if (!memberPseudo) {
                // If the user joined, they MUST have a member record. 
                // Error "Member not found" usually means the pseudo doesn't match or the record is missing.
                throw new Error("Vous n'êtes pas reconnu comme membre de ce projet. Veuillez vérifier que vous l'avez bien rejoint.");
            }

            // 2. Upload files if any
            let attachmentUrls: string[] = [];
            if (attachedFiles.length > 0) {
                attachmentUrls = await fileService.uploadMultipleFiles(attachedFiles);
            }

            // 3. Submit feedback
            console.log(`Submitting feedback for project ${project.project_id} with pseudo: ${memberPseudo}`);
            await feedbackService.createFeedback({
                project_id: project.project_id,
                member_pseudo: memberPseudo,
                content: newFeedbackContent,
                attachments: attachmentUrls
            });

            setNewFeedbackContent('');
            setAttachedFiles([]);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            // 4. Refresh feedbacks
            await fetchFeedbacks();

            // Subtle success indication instead of alert
            console.log("Feedback envoyé avec succès !");
        } catch (err: any) {
            console.error("Failed to submit feedback", err);
            const msg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
            alert(`Erreur lors de l'envoi du feedback: ${msg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#EF4444', marginBottom: '20px' }}></i>
                <h2 style={{ color: '#1F2937', marginBottom: '10px' }}>Accès Interdit ou Erreur</h2>
                <p style={{ color: '#6B7280', marginBottom: '20px' }}>{error}</p>
                <Link href="/dashboard/project" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>
                    <i className="fas fa-arrow-left"></i> Retour à mes projets
                </Link>
            </div>
        );
    }

    // Determine Admin Name
    const projectAdminMember = project?.members?.find(m => m.user_id === project.creator_id);
    const adminName = projectAdminMember?.member_pseudo || project?.creator_name || "Admin";

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <link rel="stylesheet" href="/feed.css" />

            {/* Back button */}
            <Link href="/dashboard/project" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7C3AED', textDecoration: 'none', fontWeight: 600, marginBottom: '20px' }}>
                <i className="fas fa-arrow-left"></i> Retour aux projets
            </Link>

            {/* Circular Project Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', position: 'relative' }} ref={projectInfoRef}>
                <div style={{ position: 'relative' }}
                    onMouseEnter={(e) => {
                        const overlay = e.currentTarget.querySelector('.logo-overlay') as HTMLElement;
                        if (overlay) overlay.style.opacity = '1';
                        const btn = e.currentTarget.querySelector('.logo-btn') as HTMLElement;
                        if (btn) btn.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                        const overlay = e.currentTarget.querySelector('.logo-overlay') as HTMLElement;
                        if (overlay) overlay.style.opacity = '0';
                        const btn = e.currentTarget.querySelector('.logo-btn') as HTMLElement;
                        if (btn) btn.style.transform = 'scale(1)';
                    }}
                >
                    <button
                        className="logo-btn"
                        onClick={() => setIsProjectInfoOpen(!isProjectInfoOpen)}
                        style={{
                            background: 'white', border: '2px solid #7C3AED', borderRadius: '50%', padding: '5px',
                            cursor: 'pointer', boxShadow: '0 8px 16px rgba(124, 58, 237, 0.15)',
                            width: '128px', height: '128px', overflow: 'hidden', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative', zIndex: 1
                        }}
                    >
                        <img
                            src={project?.project_logo || 'https://i.ibb.co/Qf983vG/avatar-placeholder.png'}
                            alt={project?.project_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </button>
                    {/* Hover Info Overlay */}
                    <div className="logo-overlay" style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(124, 58, 237, 0.6)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, pointerEvents: 'none',
                        opacity: 0, transition: 'opacity 0.3s ease', zIndex: 2,
                        fontSize: '0.9rem'
                    }}>
                        <span><i className="fas fa-info-circle"></i> Détails</span>
                    </div>

                    {/* Affordance Pulse Effect */}
                    <div style={{
                        position: 'absolute', top: '-5px', left: '-5px', right: '-5px', bottom: '-5px',
                        border: '2px solid rgba(124, 58, 237, 0.3)', borderRadius: '50%',
                        animation: 'pulse 2s infinite', zIndex: 0
                    }}></div>
                </div>

                <style jsx>{`
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 0.8; }
                        70% { transform: scale(1.1); opacity: 0; }
                        100% { transform: scale(1.1); opacity: 0; }
                    }
                `}</style>

                <h1 style={{ marginTop: '15px', fontSize: '1.75rem', fontWeight: 800, color: '#1F2937', letterSpacing: '-0.02em' }}>{project?.project_name}</h1>

                {/* Project Info Dropdown */}
                {isProjectInfoOpen && project && (
                    <div style={{
                        position: 'absolute', top: '130%', background: 'white', borderRadius: '16px',
                        padding: '24px', width: '320px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                        border: '1px solid #F3F4F6', zIndex: 50, textAlign: 'left'
                    }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.8rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin du projet</label>
                            <div style={{ fontWeight: 600, color: '#374151' }}>{adminName}</div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.8rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Membres ({project.number_of_members})</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                                {project.members?.map(member => {
                                    const user = globalMembers.find(u => u.user_id === member.user_id);
                                    return (
                                        <div key={member.member_id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img
                                                src={user?.user_logo || "https://i.ibb.co/Qf983vG/avatar-placeholder.png"}
                                                alt={member.member_pseudo}
                                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5E7EB' }}
                                            />
                                            <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>{member.member_pseudo}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                            <p style={{ color: '#4B5563', margin: '4px 0 0 0', fontSize: '0.95rem', lineHeight: '1.5' }}>{project.description || 'Aucune description fournie.'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Feedback Creation Form */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', fontWeight: 700 }}>Donner votre feedback</h3>
                <form onSubmit={handleFeedbackSubmit}>
                    <textarea
                        value={newFeedbackContent}
                        onChange={(e) => setNewFeedbackContent(e.target.value)}
                        placeholder="Qu'en pensez-vous ?"
                        style={{
                            width: '100%', minHeight: '100px', border: '1px solid #E5E7EB',
                            borderRadius: '12px', padding: '12px', resize: 'vertical',
                            marginBottom: '10px', fontFamily: 'inherit'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-upload" style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                color: '#6B7280', cursor: 'pointer', fontSize: '0.9rem',
                                padding: '8px 12px', borderRadius: '8px', background: '#F9FAFB'
                            }}>
                                <i className="fas fa-paperclip"></i>
                                {attachedFiles.length > 0 ? `${attachedFiles.length} fichier(s)` : 'Joindre un fichier'}
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !newFeedbackContent.trim()}
                            style={{
                                background: '#7C3AED', color: 'white', border: 'none',
                                borderRadius: '10px', padding: '10px 24px', fontWeight: 600,
                                cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1
                            }}
                        >
                            {isSubmitting ? 'Envoi...' : 'Envoyer'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Feedbacks List */}
            <div className="feedback-section">
                <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>Feedbacks récents</h3>
                {feedbacks.length > 0 ? (
                    feedbacks.map(fb => (
                        <FeedbackCard key={fb.id} data={fb} hideProjectInfo={true} />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#F9FAFB', borderRadius: '16px', color: '#9CA3AF' }}>
                        Aucun feedback disponible. Soyez le premier à en donner un !
                    </div>
                )}
            </div>
        </div>
    );
}