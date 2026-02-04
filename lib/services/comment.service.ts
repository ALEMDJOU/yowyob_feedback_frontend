
import { apiClient } from '../api-client';
import { CommentResponseDTO, CreateCommentRequestDTO, UpdateCommentRequestDTO } from '../types/api';

class CommentService {
    async createComment(request: CreateCommentRequestDTO): Promise<CommentResponseDTO> {
        return apiClient.post<CommentResponseDTO>('/comments', request);
    }

    async getCommentById(commentId: string): Promise<CommentResponseDTO> {
        return apiClient.get<CommentResponseDTO>(`/comments/${commentId}`);
    }

    async getCommentsByFeedbackId(feedbackId: string): Promise<CommentResponseDTO[]> {
        return apiClient.get<CommentResponseDTO[]>(`/comments/feedback/${feedbackId}`);
    }

    async updateComment(commentId: string, request: UpdateCommentRequestDTO): Promise<CommentResponseDTO> {
        return apiClient.put<CommentResponseDTO>(`/comments/${commentId}`, request);
    }

    async deleteComment(commentId: string): Promise<void> {
        return apiClient.delete<void>(`/comments/${commentId}`);
    }
}

export const commentService = new CommentService();
