import { apiClient } from '../api-client';
import { TwoFactorSetupResponseDTO, TwoFactorVerifyDTO, AuthResponseDTO } from '../types/api';
import { jwtService } from './jwt.service';

/**
 * Service to handle Two-Factor Authentication operations.
 */
class TwoFactorService {
    private readonly BASE_PATH = '/auth/2fa';

    /**
     * Enables Two-Factor Authentication for the current user.
     */
    async enableTwoFactor(): Promise<TwoFactorSetupResponseDTO> {
        return apiClient.post<TwoFactorSetupResponseDTO>(`${this.BASE_PATH}/enable`, {});
    }

    /**
     * Disables Two-Factor Authentication for the current user.
     */
    async disableTwoFactor(): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>(`${this.BASE_PATH}/disable`, {});
    }

    /**
     * Verifies the 2FA code to complete login.
     * @param data Identifier and 2FA code
     */
    async verifyTwoFactor(data: TwoFactorVerifyDTO): Promise<AuthResponseDTO> {
        const response = await apiClient.post<AuthResponseDTO>(`${this.BASE_PATH}/verify`, data);
        if (response.token) {
            jwtService.setToken(response.token);
        }
        return response;
    }
}

export const twoFactorService = new TwoFactorService();
