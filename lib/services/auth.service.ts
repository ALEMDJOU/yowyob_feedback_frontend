import { apiClient } from '../api-client';
import {
    LoginRequestDTO,
    RegisterRequestDTO,
    AuthResponseDTO,
    UserResponseDTO
} from '../types/api';
import { jwtService } from './jwt.service';

/**
 * Service to handle core authentication related API calls.
 * Delegating specific 2FA and Password Reset logic to their respective services.
 */
class AuthService {
    private readonly BASE_PATH = '/auth';

    /**
     * Registers a new user.
     * @param data Registration details
     */
    async register(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
        const response = await apiClient.post<AuthResponseDTO>(`${this.BASE_PATH}/register`, data);
        if (response.token) {
            jwtService.setToken(response.token);
        }
        return response;
    }

    /**
     * Authenticates a user.
     * @param data Login credentials
     */
    async login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
        const response = await apiClient.post<AuthResponseDTO>(`${this.BASE_PATH}/login`, data);
        if (response.token) {
            jwtService.setToken(response.token);
        }
        return response;
    }

    /**
     * Retrieves the currently authenticated user's information.
     */
    async getCurrentUser(): Promise<UserResponseDTO> {
        return apiClient.get<UserResponseDTO>(`${this.BASE_PATH}/me`);
    }

    /**
     * Logs out the current user and clears local storage.
     */
    async logout(): Promise<{ message: string }> {
        try {
            return await apiClient.post<{ message: string }>(`${this.BASE_PATH}/logout`, {});
        } finally {
            jwtService.clearToken();
        }
    }

    /**
     * Checks if the user is authenticated.
     */
    isAuthenticated(): boolean {
        return jwtService.hasToken();
    }
}

export const authService = new AuthService();
