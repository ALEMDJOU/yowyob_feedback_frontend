/**
 * Service to handle JWT token storage and retrieval.
 */
class JwtService {
    private readonly TOKEN_KEY = 'yowyob_token';

    /**
     * Saves the JWT token to local storage.
     * @param token The JWT token
     */
    setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.TOKEN_KEY, token);
        }
    }

    /**
     * Retrieves the JWT token from local storage.
     * @returns The token or null if not found
     */
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.TOKEN_KEY);
        }
        return null;
    }

    /**
     * Removes the JWT token from local storage.
     */
    clearToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.TOKEN_KEY);
        }
    }

    /**
     * Checks if a token exists in local storage.
     * @returns True if a token exists
     */
    hasToken(): boolean {
        return !!this.getToken();
    }
}

export const jwtService = new JwtService();
