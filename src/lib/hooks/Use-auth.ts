// lib/hooks/Use-auth.ts
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
  role: string | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loading, execute } = useApi<AuthResponse>();
  const authService = new AuthService();

  // Initialize auth state from localStorage
  const initializeAuthState = useCallback(() => {
    try {
      const userData = localStorage.getItem("user_data");
      const authToken = localStorage.getItem("auth_token");

      if (userData && authToken) {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        setRole(parsedUser.role || null);
        setToken(authToken);
      } else {
        setUser(null);
        setRole(null);
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to initialize auth state:", error);
      setUser(null);
      setRole(null);
      setToken(null);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    authService.initializeAuth();
    initializeAuthState();
  }, [initializeAuthState]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      // Clear any previous errors
      setErrorMessage(null);

      try {
        const response = await execute(() => authService.login(credentials));
        return { 
          success: true,
          message: response.message || "Login successful! Please verify OTP."
        };
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
    [execute, authService]
  );

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("company_id");
    setUser(null);
    setRole(null);
    setToken(null);
    setErrorMessage(null);
  }, [authService]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const refreshUser = useCallback(() => {
    initializeAuthState();
  }, [initializeAuthState]);

  return {
    user,
    role,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error: errorMessage,
    login,
    logout,
    clearError,
    refreshUser,
  };
}