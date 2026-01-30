import { ApiError } from './types/api';

// IMPORTANT : On utilise le chemin local défini dans next.config.ts
const BASE_URL = '/api/v1'; 

class ApiClient {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('yowyob_token') : null;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const config: RequestInit = {
            ...options,
            headers,
        };

        try {
            // Fetch appellera désormais : http://localhost:3000/api/v1/auth/me
            // Et Next.js fera le pont vers Render.com
            const response = await fetch(`${BASE_URL}${endpoint}`, config);

            if (response.status === 204) return {} as T;

            const data = await response.json();

            if (!response.ok) {
                const error: ApiError = {
                    message: data.message || 'Une erreur inattendue est survenue',
                    status: response.status,
                };
                throw error;
            }

            return data as T;
        } catch (err: any) {
            if (err.status) throw err;
            throw {
                message: err.message || 'Erreur de connexion au serveur',
                status: 500
            } as ApiError;
        }
    }

    get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    put<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    patch<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();