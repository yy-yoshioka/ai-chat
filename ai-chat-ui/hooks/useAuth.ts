import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

// User type definition
export interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

// Auth state
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  authenticated: boolean;
}

// useAuth hook return type
interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

/**
 * Authentication hook that manages user state and provides auth methods
 */
export function useAuth(): UseAuthReturn {
  // Initialize auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    authenticated: false,
  });

  /**
   * Fetch the current user data from the /api/me endpoint
   */
  const refreshUser = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error, status } = await api.get<{ user: User }>('/me');

      if (error || status !== 200) {
        setAuthState({
          user: null,
          loading: false,
          error: error || 'Failed to fetch user data',
          authenticated: false,
        });
        return;
      }

      setAuthState({
        user: data?.user || null,
        loading: false,
        error: null,
        authenticated: Boolean(data?.user),
      });
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        authenticated: false,
      });
    }
  }, []);

  /**
   * Login the user with email and password
   */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setAuthState((prev) => ({ ...prev, loading: true, error: null }));

        const { error, status } = await api.post<{ token: string }>('/login', {
          email,
          password,
        });

        if (error || status !== 200) {
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: error || 'Login failed',
            authenticated: false,
          }));
          return false;
        }

        // Refresh user data after successful login
        await refreshUser();
        return true;
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Login failed',
          authenticated: false,
        }));
        return false;
      }
    },
    [refreshUser]
  );

  /**
   * Sign up a new user with email, password, and optional name
   */
  const signup = useCallback(
    async (email: string, password: string, name?: string): Promise<boolean> => {
      try {
        setAuthState((prev) => ({ ...prev, loading: true, error: null }));

        const { error, status } = await api.post<{ user: User }>('/signup', {
          email,
          password,
          name,
        });

        if (error || status !== 201) {
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: error || 'Signup failed',
            authenticated: false,
          }));
          return false;
        }

        // Refresh user data after successful signup
        await refreshUser();
        return true;
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Signup failed',
          authenticated: false,
        }));
        return false;
      }
    },
    [refreshUser]
  );

  /**
   * Logout the current user
   */
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { error, status } = await api.post('/logout', {});

      if (error && status !== 200) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error || 'Logout failed',
        }));
        return false;
      }

      // Clear user data regardless of the response
      setAuthState({
        user: null,
        loading: false,
        error: null,
        authenticated: false,
      });

      return true;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
      return false;
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    refreshUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...authState,
    login,
    signup,
    logout,
    refreshUser,
  };
}
