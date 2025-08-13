// React hook for authentication
import { useState, useCallback, useEffect } from "react";
import { useApi } from "@/lib/api-client";
import {
  AuthResponse,
  AuthService,
  LoginCredentials,
  User,
} from "@/services/auth-service";

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null; // Changed to string for error message
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  clearError: () => void; // Add method to clear errors
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loading, execute } = useApi<AuthResponse>();
  const authService = new AuthService();

  // Initialize auth state
  useEffect(() => {
    authService.initializeAuth();
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      // Clear any previous errors
      setErrorMessage(null);

      try {
        const response = await execute(() => authService.login(credentials));
        setUser(response.data.user);
        return { success: true };
      } catch (error) {
        // Extract error message
        let message = "Login failed. Please try again.";

        if (error && typeof error === "object") {
          if ("message" in error && typeof error.message === "string") {
            message = error.message;
          }

          // Handle validation errors
          if ("errors" in error && error.errors) {
            const errors = error.errors as {
              email?: string[];
              password?: string[];
            };
            if (errors?.email?.[0]) {
              message = errors.email[0];
            } else if (errors?.password?.[0]) {
              message = errors.password[0];
            }
          }
        }

        setErrorMessage(message);
        return { success: false, message };
      }
    },
    [execute]
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setErrorMessage(null);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    user,
    isAuthenticated: authService.isAuthenticated(),
    loading,
    error: errorMessage,
    login,
    logout,
    clearError,
  };
}
