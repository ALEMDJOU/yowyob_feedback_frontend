import { apiClient } from '../api-client';
import { UserResponseDTO } from '../types/api';

/**
 * Service gérant les opérations liées à l'utilisateur
 * En lien direct avec AuthController.java et AuthService.java du backend
 */
export const userService = {
    /**
     * Récupère les informations complètes de l'utilisateur connecté.
     * Endpoint : GET /api/v1/auth/me
     * Le backend utilise buildCompleteUserResponse pour fusionner 
     * les données de AppUser avec Person ou Organization.
     */
    getCurrentUser: async (): Promise<UserResponseDTO> => {
        try {
            return await apiClient.get<UserResponseDTO>('/auth/me');
        } catch (error: any) {
            console.error("Erreur [userService.getCurrentUser]:", error);
            // On relance l'erreur pour qu'elle soit gérée par le composant (UI)
            throw error;
        }
    },

    /**
     * Optionnel : Met à jour les informations de profil.
     * Nécessite un endpoint correspondant dans ton AuthController.
     */
    updateProfile: async (userData: Partial<UserResponseDTO>): Promise<UserResponseDTO> => {
        try {
            return await apiClient.put<UserResponseDTO>('/auth/profile/update', userData);
        } catch (error: any) {
            console.error("Erreur [userService.updateProfile]:", error);
            throw error;
        }
    },

    /**
     * Déconnexion sécurisée.
     * Bien que le JWT se gère côté client (suppression du token), 
     * on appelle l'endpoint logout du backend pour la cohérence.
     */
    logout: async (): Promise<void> => {
        try {
            await apiClient.post('/auth/logout', {});
        } catch (error) {
            console.warn("Le serveur n'a pas pu traiter le logout, suppression locale uniquement.");
        } finally {
            // Nettoyage impératif du token local
            if (typeof window !== 'undefined') {
                localStorage.removeItem('yowyob_token');
                // Optionnel : rediriger vers la page de connexion
                window.location.href = '/auth/login';
            }
        }
    }
};