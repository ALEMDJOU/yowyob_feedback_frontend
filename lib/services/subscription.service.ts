import { apiClient } from '../api-client';
import { PageResponse, PersonDTO, SubscriptionDTO, SubscriptionStatsDTO } from '../types/api';

/**
 * Service gérant les abonnements entre utilisateurs.
 * En lien avec SubscriptionController du backend.
 */
export const subscriptionService = {
    /**
     * S'abonner à un utilisateur.
     */
    subscribe: async (followedId: string): Promise<SubscriptionDTO> => {
        return await apiClient.post<SubscriptionDTO>(`/subscribe/${followedId}`, {});
    },

    /**
     * Se désabonner d'un utilisateur.
     */
    unsubscribe: async (followedId: string): Promise<void> => {
        return await apiClient.delete(`/unsubscribe/${followedId}`);
    },

    /**
     * Récupère la liste des personnes suivies par l'utilisateur connecté.
     */
    getFollowing: async (page = 0, size = 20): Promise<PageResponse<PersonDTO>> => {
        return await apiClient.get<PageResponse<PersonDTO>>(`/following?page=${page}&size=${size}`);
    },

    /**
     * Récupère la liste des abonnés de l'utilisateur connecté.
     */
    getFollowers: async (page = 0, size = 20): Promise<PageResponse<PersonDTO>> => {
        return await apiClient.get<PageResponse<PersonDTO>>(`/followers?page=${page}&size=${size}`);
    },

    /**
     * Récupère les statistiques d'abonnement.
     */
    getStats: async (): Promise<SubscriptionStatsDTO> => {
        return await apiClient.get<SubscriptionStatsDTO>('/subscription/stats');
    },

    /**
     * Vérifie si l'utilisateur connecté suit un autre utilisateur.
     */
    checkSubscription: async (followedId: string): Promise<boolean> => {
        return await apiClient.get<boolean>(`/subscription/check/${followedId}`);
    }
};
