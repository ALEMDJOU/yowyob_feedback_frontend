import { apiClient } from '../api-client';
import { PasswordResetRequestDTO, PasswordResetConfirmDTO } from '../types/api';

/**
 * Service to handle password reset operations.
 */
class PasswordResetService {
    private readonly BASE_PATH = '/auth/password-reset';

    /**
     * Requests a password reset link to be sent via email.
     * @param data Email data
     */
    async requestPasswordReset(data: PasswordResetRequestDTO): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>(`${this.BASE_PATH}/request`, data);
    }

    /**
     * Confirms the password reset with a token and new password.
     * @param data Token and new password details
     */
    async confirmPasswordReset(data: PasswordResetConfirmDTO): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>(`${this.BASE_PATH}/confirm`, data);
    }
}

export const passwordResetService = new PasswordResetService();
