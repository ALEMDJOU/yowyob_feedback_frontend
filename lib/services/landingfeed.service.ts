import { apiClient } from '../api-client';
import { FeedbackResponseDTO } from './feedback.service';

export const landingfeedService = {
    /**
     * Récupère tous les feedbacks et enrichit chacun avec le logo de son projet.
     * 1. GET /feedbacks/all → liste des feedbacks
     * 2. Pour chaque projet unique → GET /projects/{name} pour récupérer le logo
     */
    getAllFeedbacks: async (): Promise<FeedbackResponseDTO[]> => {
        try {
            const feedbacks = await apiClient.get<FeedbackResponseDTO[]>('/feedbacks/all');

            if (!feedbacks || feedbacks.length === 0) return [];

            // Collecter les noms de projets uniques
            const projectNames = [...new Set(feedbacks.map(fb => fb.project_name).filter(Boolean))];

            // Récupérer les détails de chaque projet en parallèle
            const projectLogoMap = new Map<string, string>();

            await Promise.allSettled(
                projectNames.map(async (name) => {
                    try {
                        const project = await apiClient.get<{ project_logo?: string }>(
                            `/projects/${encodeURIComponent(name)}`
                        );
                        if (project?.project_logo) {
                            projectLogoMap.set(name, project.project_logo);
                        }
                    } catch {
                        // Silently ignore individual project fetch errors
                    }
                })
            );

            // Enrichir les feedbacks avec le logo du projet correspondant
            return feedbacks.map(fb => ({
                ...fb,
                project_logo: projectLogoMap.get(fb.project_name) || fb.project_logo || undefined,
            }));

        } catch (error) {
            console.error("Erreur lors de la récupération des feedbacks pour la landing page:", error);
            return [];
        }
    }
};
