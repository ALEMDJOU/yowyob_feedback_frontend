import { userService } from './user.service';
import { feedbackService, FeedbackResponseDTO } from './feedback.service';
import { projectService } from './project.service';
import { UserResponseDTO } from '../types/api';
import { subscriptionService } from './subscription.service';

export interface AggregatedFeed {
    feedbacks: (FeedbackResponseDTO & { author?: UserResponseDTO })[];
    users: UserResponseDTO[];
}

export const feedService = {
    /**
     * Agrège les feedbacks de tous les projets de l'utilisateur ET de ses abonnements.
     * C'est l'alternative robuste à un endpoint global inexistant.
     */
    getGlobalFeed: async (): Promise<AggregatedFeed> => {
        try {
            // 1. Récupérer les projets et les abonnements en parallèle
            const [myProjects, followingPage] = await Promise.all([
                projectService.getUserProjects().catch(() => []),
                subscriptionService.getFollowing().catch(() => ({ content: [] }))
            ]);

            // 2. Identifier les créateurs cibles (projets rejoints + personnes suivies)
            const targetCreatorIds = new Set<string>();
            myProjects.forEach((p: any) => targetCreatorIds.add(p.creator_id));
            followingPage.content.forEach((p: any) => targetCreatorIds.add(p.userId));

            if (targetCreatorIds.size === 0) {
                return { feedbacks: [], users: [] };
            }

            // 3. Récupérer TOUS les feedbacks de TOUS les projets de ces créateurs
            const feedbacksPromises = Array.from(targetCreatorIds).map(creatorId =>
                feedbackService.getFeedbacksByUserProjects(creatorId)
            );
            const feedbacksArrays = await Promise.all(feedbacksPromises);
            const allFeedbacksRaw: FeedbackResponseDTO[] = feedbacksArrays.flat();

            // 4. Récupérer les membres des projets dont nous sommes créateurs
            const currentUser = await userService.getCurrentUser().catch(() => null);

            const memberPromises = myProjects
                .filter((p: any) => !currentUser || p.creator_id === currentUser.user_id)
                .map((p: any) => userService.getProjectMembers(p.project_name));

            const membersResults = await Promise.allSettled(memberPromises);

            const allMembersMap = new Map<string, UserResponseDTO>();
            const uniqueUsersMap = new Map<string, UserResponseDTO>();

            membersResults.forEach(result => {
                if (result.status === 'fulfilled') {
                    result.value.forEach((m: any) => {
                        if (m.member_id) {
                            allMembersMap.set(m.member_id, m as UserResponseDTO);
                        }
                        if (m.user_id) {
                            uniqueUsersMap.set(m.user_id, m as UserResponseDTO);
                        }
                    });
                }
            });

            // 5. Enrichir les feedbacks avec les auteurs si on les connaît
            const enrichedFeedbacks = allFeedbacksRaw.map((fb: FeedbackResponseDTO) => ({
                ...fb,
                author: allMembersMap.get(fb.member_id)
            }));

            // Trier par date décroissante
            enrichedFeedbacks.sort((a, b) =>
                new Date(b.feedback_date_time).getTime() - new Date(a.feedback_date_time).getTime()
            );

            return {
                feedbacks: enrichedFeedbacks,
                users: Array.from(uniqueUsersMap.values())
            };
        } catch (error) {
            console.error("Erreur [feedService.getGlobalFeed]:", error);
            return { feedbacks: [], users: [] };
        }
    }
};
