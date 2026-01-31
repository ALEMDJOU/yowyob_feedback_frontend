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
            const response = await fetch(`${BASE_URL}${endpoint}`, config);

            // Handle 204 No Content
            if (response.status === 204) return {} as T;

            // Check if response has content
            const contentType = response.headers.get('content-type');
            const hasJsonContent = contentType?.includes('application/json');

            // Get response text first to check if it's empty
            const text = await response.text();

            // Parse JSON only if we have content
            let data: any = {};
            if (text && hasJsonContent) {
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError, 'Response text:', text);
                    if (!response.ok) {
                        throw {
                            message: 'Erreur de format de réponse du serveur',
                            status: response.status
                        } as ApiError;
                    }
                    // If response is OK but JSON is invalid, return empty object
                    return {} as T;
                }
            }

            if (!response.ok) {
                // Log detailed error information for debugging
                console.error('❌ API Error Details:');
                console.error('  Status:', response.status);
                console.error('  Status Text:', response.statusText);
                console.error('  Endpoint:', `${BASE_URL}${endpoint}`);
                console.error('  Method:', config.method);
                console.error('  Response Data:', data);
                console.error('  Message:', data.message || data.error);
                console.error('  Validation Errors:', data.errors || data.fieldErrors || 'None');

                const error: ApiError = {
                    message: data.message || data.error || 'Une erreur inattendue est survenue',
                    status: response.status,
                };
                throw error;
            }

            return data as T;
        } catch (err: any) {
            // Enhanced error logging
            console.error('❌ Request Failed:');
            console.error('  Endpoint:', `${BASE_URL}${endpoint}`);
            console.error('  Method:', config.method);
            console.error('  Error Message:', err.message);
            console.error('  Error Status:', err.status);
            console.error('  Error Name:', err.name);
            console.error('  Full Error:', err);

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