import { apiClient } from '../api-client';
import { UserResponseDTO, AuthResponseDTO, UpdateProfileRequestDTO } from '../types/api';

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
            console.error("Erreur [userService.getCurrentUser]:", error.message || error);
            throw error;
        }
    },

    /**
     * Met à jour les informations de profil de l'utilisateur connecté.
     * Endpoint : PATCH /api/v1/profile
     */
    updateProfile: async (userData: UpdateProfileRequestDTO): Promise<AuthResponseDTO> => {
        try {
            // 🔍 DEBUG: Log exact payload being sent
            console.log('📤 [updateProfile] Sending data to backend:', JSON.stringify(userData, null, 2));
            console.log('📤 [updateProfile] Field count:', Object.keys(userData).length);

            const response = await apiClient.patch<AuthResponseDTO>('/profile', userData);

            console.log('✅ [updateProfile] Success:', response);
            return response;
        } catch (error: any) {
            // 🔍 DEBUG: Enhanced error logging
            console.error('❌ [userService.updateProfile] Error occurred:');
            console.error('  Message:', error.message);
            console.error('  Status:', error.status);
            console.error('  Name:', error.name);
            console.error('  Full Error:', error);
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
            }
        }
    },

    /**
     * Récupère les membres d'un projet spécifique.
     * Utile pour récupérer les profils utilisateur dans le contexte d'un projet.
     * Endpoint : GET /api/v1/projects/{projectName}/members
     */
    getProjectMembers: async (projectName: string): Promise<UserResponseDTO[]> => {
        try {
            return await apiClient.get<UserResponseDTO[]>(`/projects/${encodeURIComponent(projectName)}/members`);
        } catch (error: any) {
            // Un professionnel gère les erreurs de manière informative et évite de polluer la console
            const status = error.status || error.response?.status;
            const message = error.message || "Erreur inconnue";

            if (status === 403) {
                // On sait que le backend restreint parfois l'accès aux membres aux seuls créateurs
                console.debug(`[userService.getProjectMembers] Accès restreint pour le projet "${projectName}".`);
            } else {
                console.error(`Erreur [userService.getProjectMembers] pour ${projectName}:`, message);
            }
            return [];
        }
    }
};
