import { apiClient } from '../api-client';
import { PageResponse, PersonDTO, SubscriptionStatsDTO } from '../types/api';

/**
 * Service gérant les abonnements entre utilisateurs.
 * En lien avec SubscriptionController du backend.
 */
export const subscriptionService = {
    /**
     * S'abonner à un utilisateur.
     */
    subscribe: async (followedId: string) => {
        return await apiClient.post(`/subscribe/${followedId}`, {});
    },

    /**
     * Se désabonner d'un utilisateur.
     */
    unsubscribe: async (followedId: string) => {
        return await apiClient.delete(`/unsubscribe/${followedId}`);
    },

    /**
     * Vérifie si l'utilisateur connecté suit un autre utilisateur.
     */
    checkSubscription: async (followedId: string): Promise<boolean> => {
        return await apiClient.get<boolean>(`/subscription/check/${followedId}`);
    },

    /**
     * Récupère la liste des personnes suivies par l'utilisateur connecté.
     */
    getFollowing: async (page = 0, size = 20) => {
        return await apiClient.get<PageResponse<PersonDTO>>(`/following?page=${page}&size=${size}`);
    },

    /**
     * Récupère la liste des abonnés de l'utilisateur connecté.
     */
    getFollowers: async (page = 0, size = 20) => {
        return await apiClient.get<PageResponse<PersonDTO>>(`/followers?page=${page}&size=${size}`);
    },

    /**
     * Récupère les statistiques d'abonnement.
     */
    getSubscriptionStats: async () => {
        return await apiClient.get<SubscriptionStatsDTO>(`/subscription/stats`);
    }
};
