import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, saveToken, clearToken, loadToken } from '../lib/api';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    /** True only while the initial session is being restored on app start */
    isInitializing: boolean;
    /** True while a login / signup / logout request is in-flight */
    isLoading: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    // Restore session from AsyncStorage on app start
    useEffect(() => {
        const restoreSession = async () => {
            try {
                await loadToken(); // prime the in-memory token cache
                const storedUser = await AsyncStorage.getItem('fintrack_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Failed to restore auth session', error);
            } finally {
                setIsInitializing(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const data = await api.post<{ token: string }>('auth/login', { email, password });
            await saveToken(data.token);

            // Fetch the authenticated user profile
            const userData = await api.get<User>('auth/me');
            await AsyncStorage.setItem('fintrack_user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('Login failed', error);
            throw error; // re-throw so the screen can show the error message
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const data = await api.post<{ token: string }>('auth/register', { name, email, password });
            await saveToken(data.token);

            // Fetch the authenticated user profile
            const userData = await api.get<User>('auth/me');
            await AsyncStorage.setItem('fintrack_user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('Signup failed', error);
            throw error; // re-throw so the screen can show the error message
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await clearToken();
            await AsyncStorage.removeItem('fintrack_user');
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isInitializing, isLoading, user, login, logout, signup }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
