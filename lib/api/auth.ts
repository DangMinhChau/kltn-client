import { User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
}

interface TokenVerificationResponse {
  valid: boolean;
  user: {
    id: string;
    email: string;
    role: "ADMIN" | "CUSTOMER";
  };
}

class AuthApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/auth${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`
      );
    }

    // Backend trả về format: { statusCode, message, data: T, meta, timestamp, path }
    // Trả về data từ wrapper response
    return result.data || result;
  }

  private getAuthHeaders(token?: string): Record<string, string> {
    const accessToken = token || localStorage.getItem("accessToken");
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout(token?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/logout", {
      method: "POST",
      headers: this.getAuthHeaders(token),
    });
  }
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/refresh", {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
  }

  async getCurrentUser(token?: string): Promise<{ user: User }> {
    return this.request<{ user: User }>("/me", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });
  }

  async verifyToken(token?: string): Promise<TokenVerificationResponse> {
    return this.request<TokenVerificationResponse>("/verify-token", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });
  }
  async changePassword(
    data: ChangePasswordRequest,
    token?: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>("/change-password", {
      method: "PATCH",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<{ message: string; resetToken?: string }> {
    return this.request<{ message: string; resetToken?: string }>(
      "/forgot-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>("/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateProfile(
    data: UpdateProfileRequest,
    token?: string
  ): Promise<User> {
    const url = `${API_BASE_URL}/users/profile`;
    const config: RequestInit = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`
      );
    }

    // Backend returns wrapped response: { statusCode, message, data: User, meta, timestamp, path }
    return result.data || result;
  }
}

export const authApi = new AuthApiClient();

// Named exports for individual functions
export const login = (credentials: LoginRequest) => authApi.login(credentials);
export const register = (userData: RegisterRequest) =>
  authApi.register(userData);
export const logout = (token?: string) => authApi.logout(token);
export const refreshToken = (refreshToken: string) =>
  authApi.refreshToken(refreshToken);
export const getCurrentUser = (token?: string) => authApi.getCurrentUser(token);
export const verifyToken = (token?: string) => authApi.verifyToken(token);
export const changePassword = (data: ChangePasswordRequest, token?: string) =>
  authApi.changePassword(data, token);
export const forgotPassword = (data: ForgotPasswordRequest) =>
  authApi.forgotPassword(data);
export const resetPassword = (data: ResetPasswordRequest) =>
  authApi.resetPassword(data);
export const updateProfile = (data: UpdateProfileRequest, token?: string) =>
  authApi.updateProfile(data, token);

export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  TokenVerificationResponse,
};
