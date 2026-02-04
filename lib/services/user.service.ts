import { apiClient } from '../api-client';
import { UserResponseDTO, AuthResponseDTO, UpdateProfileRequestDTO, MemberResponseDTO } from '../types/api';

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
            throw error;
        }
    },

    /**
     * Met à jour les informations de profil de l'utilisateur connecté.
     * Endpoint : PATCH /api/v1/profile
     */
    updateProfile: async (userData: UpdateProfileRequestDTO): Promise<AuthResponseDTO> => {
        try {
            const response = await apiClient.patch<AuthResponseDTO>('/profile', userData);
            return response;
        } catch (error: any) {
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
            // Silence failure
        } finally {
            // Nettoyage impératif du token local
            if (typeof window !== 'undefined') {
                localStorage.removeItem('yowyob_token');
            }
        }
    },

    /**
     * Récupère les membres d'un projet spécifique.
     * Utile pour récupérer les pseudos des membres.
     * Endpoint : GET /api/v1/projects/{projectName}/members
     */
    getProjectMembers: async (projectName: string): Promise<MemberResponseDTO[]> => {
        try {
            return await apiClient.get<MemberResponseDTO[]>(`/projects/${encodeURIComponent(projectName)}/members`);
        } catch (error: any) {
            // On renvoie un tableau vide pour ne pas bloquer le composant
            return [];
        }
    }
};
