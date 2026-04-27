import AsyncStorage from '@react-native-async-storage/async-storage';

// const FALLBACK_URL = __DEV__ ? 'http://localhost:5000/api' : '';
// const API_URL = process.env.EXPO_PUBLIC_API_URL || FALLBACK_URL;
const FALLBACK_URL = __DEV__ ? 'http://localhost:5000' : '';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || FALLBACK_URL) + '/api';

if (!__DEV__ && !API_URL) {
    console.error('FATAL ERROR: EXPO_PUBLIC_API_URL is missing in production build.');
}
// In-memory cache so we don't await AsyncStorage on every request
let cachedToken: string | null = null;

export async function loadToken(): Promise<void> {
    cachedToken = await AsyncStorage.getItem('fintrack_token');
}

export async function saveToken(token: string): Promise<void> {
    cachedToken = token;
    await AsyncStorage.setItem('fintrack_token', token);
}

export async function clearToken(): Promise<void> {
    cachedToken = null;
    await AsyncStorage.removeItem('fintrack_token');
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    let normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    const apiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const url = `${apiUrl}/${normalizedPath}`;

    // Refresh token cache if not loaded yet
    if (cachedToken === null) {
        cachedToken = await AsyncStorage.getItem('fintrack_token');
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (cachedToken) {
        headers.Authorization = `Bearer ${cachedToken}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
        try {
            const errorData = await res.json();
            throw new Error(errorData.message || errorData.error || `Request failed: ${res.status}`);
        } catch {
            throw new Error(`Request failed with status ${res.status}`);
        }
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return (await res.json()) as T;
}

export const api = {
    get: <T>(path: string) => apiRequest<T>(path),
    post: <T>(path: string, body: unknown) =>
        apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) =>
        apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
        apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    del: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
