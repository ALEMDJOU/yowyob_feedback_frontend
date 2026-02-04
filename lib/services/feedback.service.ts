import { apiClient } from '../api-client';

export interface FeedbackResponseDTO {
    feedback_id: string;
    feedback_date_time: string;
    content: string;
    attachments: string[];
    target_project_id: string;
    project_name: string;
    project_logo?: string; // Added to display project logo on feedbacks
    member_id: string;
    member_pseudo: string;
    number_of_likes: number;
    number_of_comments: number;
}

export interface CreateFeedbackRequestDTO {
    project_id: string;
    member_pseudo: string;
    content: string;
    attachments: string[];
}

export interface UpdateFeedbackRequestDTO {
    content: string;
    attachments: string[];
}

class FeedbackService {
    async createFeedback(request: CreateFeedbackRequestDTO): Promise<FeedbackResponseDTO> {
        return apiClient.post<FeedbackResponseDTO>('/feedbacks', request);
    }

    async getFeedbackById(feedbackId: string): Promise<FeedbackResponseDTO> {
        return apiClient.get<FeedbackResponseDTO>(`/feedbacks/${feedbackId}`);
    }

    async getFeedbacksByProjectId(projectId: string): Promise<FeedbackResponseDTO[]> {
        if (!projectId) return [];
        try {
            return await apiClient.get<FeedbackResponseDTO[]>(`/feedbacks/project/${projectId}`);
        } catch (error) {
            console.error(`Failed to fetch feedbacks for project ${projectId}`, error);
            return [];
        }
    }

    async getFeedbacksByMemberAndProject(memberPseudo: string, projectId: string): Promise<FeedbackResponseDTO[]> {
        return apiClient.get<FeedbackResponseDTO[]>(`/feedbacks/member/${encodeURIComponent(memberPseudo)}/project/${projectId}`);
    }

    async getFeedbacksByUserProjects(userId: string): Promise<FeedbackResponseDTO[]> {
        return apiClient.get<FeedbackResponseDTO[]>(`/feedbacks/user/${userId}/projects`);
    }

    async updateFeedback(feedbackId: string, request: UpdateFeedbackRequestDTO): Promise<FeedbackResponseDTO> {
        return apiClient.put<FeedbackResponseDTO>(`/feedbacks/${feedbackId}`, request);
    }

    async deleteFeedback(feedbackId: string): Promise<void> {
        return apiClient.delete<void>(`/feedbacks/${feedbackId}`);
    }
}

export const feedbackService = new FeedbackService();
