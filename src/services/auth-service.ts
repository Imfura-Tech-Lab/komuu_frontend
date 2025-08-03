import { ApiClient, ApiResponse, apiClient } from "@/lib/api-client";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_in?: number;
}

export interface LoginError {
  message: string;
  status: number;
  errors?: {
    email?: string[];
    password?: string[];
  };
}

export class AuthService {
  private client: ApiClient;
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "auth_user";

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  /**
   * Login user with email and password
   */
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<AuthResponse>("login", credentials);

    if (response.data.token) {
      // Store token and user data
      this.setToken(response.data.token);
      this.setUser(response.data.user);

      // Set token in API client for future requests
      this.client.setAuthToken(response.data.token);
    }

    return response;
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    this.clearToken();
    this.clearUser();
    this.client.removeAuthToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;

    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Initialize auth state on app startup
   */
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      this.client.setAuthToken(token);
    }
  }

  /**
   * Store authentication token
   */
  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Store user data
   */
  private setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Clear stored token
   */
  private clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Clear stored user data
   */
  private clearUser(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * Register a new user with form data
   */
  async register(formData: FormData): Promise<ApiResponse> {
   try {
     console.log("Registering user with form data:", formData);
     const response = await fetch(
       `${process.env.NEXT_PUBLIC_BACKEND_API_URL}membership-signup`,
       {
         method: "POST",
         body: formData,
         headers: {
           Accept: "application/json",
         },
       }
     );

     if (!response.ok) {
       const errorData = await response.json();
       throw {
         message: errorData.message || `HTTP ${response.status}`,
         status: response.status,
         errors: errorData.errors,
       };
     }

     const data = await response.json();
     return {
       data,
       status: response.status,
       message: data.message,
     };
   } catch (error) {
     throw error;
   }
  }
}

// Create singleton instance
export const authService = new AuthService();
