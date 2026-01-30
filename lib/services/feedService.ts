import { userService } from './user.service';
import { feedbackService, FeedbackResponseDTO } from './feedback.service';
import { projectService } from './project.service';
import { UserResponseDTO } from '../types/api';

export interface AggregatedFeed {
    feedbacks: (FeedbackResponseDTO & { author?: UserResponseDTO })[];
    users: UserResponseDTO[];
}

export const feedService = {
    /**
     * Agrège les feedbacks de tous les projets de l'utilisateur.
     * C'est l'alternative robuste à un endpoint global inexistant.
     */
    getGlobalFeed: async (): Promise<AggregatedFeed> => {
        try {
            // 1. Récupérer les projets de l'utilisateur
            const projects = await projectService.getUserProjects();

            // 2. Pour chaque projet, récupérer les feedbacks et les membres par projet
            // On parallélise pour la performance
            const feedPromises = projects.map(async (project) => {
                const [feedbacks, members] = await Promise.all([
                    feedbackService.getFeedbacksByProjectId(project.project_id),
                    userService.getProjectMembers(project.project_name)
                ]);
                return { feedbacks, members };
            });

            const results = await Promise.all(feedPromises);

            // 3. Consolider tous les feedbacks et tous les membres (utilisateurs uniques)
            const allFeedbacks: (FeedbackResponseDTO & { author?: UserResponseDTO })[] = [];
            const allMembersMap = new Map<string, UserResponseDTO>();

            results.forEach(({ feedbacks, members }) => {
                members.forEach(m => {
                    if (m.user_id) allMembersMap.set(m.user_id, m);
                });

                feedbacks.forEach(fb => {
                    // On cherche l'auteur parmi les membres récupérés pour CE projet
                    const author = members.find(m => m.user_id === fb.member_id || m.email === fb.member_pseudo);
                    allFeedbacks.push({ ...fb, author });
                });
            });

            // Trier par date décroissante
            allFeedbacks.sort((a, b) =>
                new Date(b.feedback_date_time).getTime() - new Date(a.feedback_date_time).getTime()
            );

            return {
                feedbacks: allFeedbacks,
                users: Array.from(allMembersMap.values())
            };
        } catch (error) {
            console.error("Erreur [feedService.getGlobalFeed]:", error);
            return { feedbacks: [], users: [] };
        }
    }
};
