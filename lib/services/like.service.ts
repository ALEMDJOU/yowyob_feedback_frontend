import { apiClient } from '../api-client';
import { LikeResponseDTO } from '../types/api';

export const likeService = {
    /**
     * Creates a new like on a feedback.
     * Endpoint : POST /api/v1/likes
     */
    createLike: async (feedbackId: string): Promise<LikeResponseDTO> => {
        try {
            return await apiClient.post<LikeResponseDTO>('/likes', { feedback_id: feedbackId });
        } catch (error: any) {
            console.error("Failed to create like", error);
            throw error;
        }
    },

    /**
     * Gets likes for a specific feedback.
     * Endpoint : GET /api/v1/likes/feedback/{feedbackId}
     */
    getLikesByFeedback: async (feedbackId: string): Promise<LikeResponseDTO[]> => {
        try {
            return await apiClient.get<LikeResponseDTO[]>(`/likes/feedback/${feedbackId}`);
        } catch (error: any) {
            console.error("Failed to get likes by feedback", error);
            throw error;
        }
    },

    /**
     * Deletes a like on a feedback.
     * Endpoint : DELETE /api/v1/likes/feedback/{feedbackId}/liker
     */
    deleteLike: async (feedbackId: string): Promise<void> => {
        try {
            await apiClient.delete(`/likes/feedback/${feedbackId}/liker`);
        } catch (error: any) {
            console.error("Failed to delete like", error);
            throw error;
        }
    },

    /**
     * Gets a specific like by feedback and liker.
     * Endpoint : GET /api/v1/likes/feedback/{feedbackId}/liker/{likerId}
     */
    getLikeByFeedbackAndLiker: async (feedbackId: string, likerId: string): Promise<LikeResponseDTO> => {
        try {
            return await apiClient.get<LikeResponseDTO>(`/likes/feedback/${feedbackId}/liker/${likerId}`);
        } catch (error: any) {
            console.error("Failed to get like by feedback and liker", error);
            throw error;
        }
    },

    /**
     * Gets all likes by a specific user.
     * Endpoint : GET /api/v1/likes/user/{likerId}
     */
    getLikesByUser: async (likerId: string): Promise<LikeResponseDTO[]> => {
        try {
            return await apiClient.get<LikeResponseDTO[]>(`/likes/user/${likerId}`);
        } catch (error: any) {
            console.error("Failed to get likes by user", error);
            throw error;
        }
    }
};
