// lib/api-client.ts

import { ApiError } from './types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        // Récupération du token depuis le localStorage (clé yowyob_token comme utilisé dans ton projet)
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
            const response = await fetch(`${BASE_URL}${endpoint}`, config);

            // Gestion des réponses vides (No Content)
            if (response.status === 204) {
                return {} as T;
            }

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
            // Gestion des erreurs réseau ou parsing
            if (err.status) throw err; // C'est déjà une ApiError
            
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

// CRUCIAL : On exporte une instance déjà créée pour qu'elle soit partagée partout
export const apiClient = new ApiClient();