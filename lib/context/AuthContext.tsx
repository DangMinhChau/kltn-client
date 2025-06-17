"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { User } from "@/types";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<{
    message: string;
    user?: any;
    accessToken?: string;
    refreshToken?: string;
  }>;
  resendVerificationEmail: (email: string) => Promise<{ message: string }>;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

type AuthAction =
  | { type: "AUTH_START" }
  | {
      type: "AUTH_SUCCESS";
      payload: { user: User; accessToken: string; refreshToken: string };
    }
  | { type: "AUTH_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true, // Start with loading true until we check localStorage
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true };
    case "AUTH_SUCCESS":
      const newState = {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isLoading: false,
        isAuthenticated: !!(action.payload.user && action.payload.accessToken),
      };
      console.log("AUTH_SUCCESS - New state:", newState);
      return newState;
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return initialState;
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState); // Load auth state from localStorage on mount (only on client)
  useEffect(() => {
    const loadAuthState = () => {
      try {
        if (typeof window !== "undefined") {
          const accessToken = localStorage.getItem("accessToken");
          const refreshToken = localStorage.getItem("refreshToken");
          const userData = localStorage.getItem("user");

          if (accessToken && refreshToken && userData) {
            const user = JSON.parse(userData);
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user, accessToken, refreshToken },
            });
          } else {
            // No saved auth data, set loading to false
            dispatch({ type: "SET_LOADING", payload: false });
          }
        } else {
          // Server-side, just set loading to false
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        // Error loading, set loading to false
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadAuthState();
  }, []);
  // Save auth state to localStorage
  useEffect(() => {
    console.log("LocalStorage effect triggered:", {
      isAuthenticated: state.isAuthenticated,
      hasAccessToken: !!state.accessToken,
      hasRefreshToken: !!state.refreshToken,
      hasUser: !!state.user,
    });
    if (
      state.isAuthenticated &&
      state.accessToken &&
      state.refreshToken &&
      state.user
    ) {
      console.log("Saving to localStorage:", state.user.fullName);
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", state.accessToken);
        localStorage.setItem("refreshToken", state.refreshToken);
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    } else {
      console.log("Clearing localStorage");
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }
  }, [
    state.isAuthenticated,
    state.accessToken,
    state.refreshToken,
    state.user,
  ]);
  const login = async (email: string, password: string): Promise<User> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      console.log("Raw API response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Đăng nhập thất bại");
      } // Backend trả về format wrapped: { statusCode, message, data: { user, accessToken, refreshToken, expiresIn, tokenType }, meta, timestamp, path }
      const { data } = result;
      console.log("Extracted data:", data);

      if (!data || !data.user || !data.accessToken || !data.refreshToken) {
        throw new Error("Invalid response format from server");
      }

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      });
      console.log("Auth state updated successfully"); // Force save to localStorage immediately
      console.log("Force saving to localStorage...");
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      console.log("localStorage saved manually");

      // Return the user data for redirect logic
      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      dispatch({ type: "AUTH_FAILURE" });
      throw error;
    }
  };
  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      console.log("Register API response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Đăng ký thất bại");
      }

      const { data } = result;
      console.log("Register extracted data:", data);

      if (!data || !data.user) {
        throw new Error("Invalid response format from server");
      }

      // Check if email verification is required
      if (data.requiresEmailVerification || !data.accessToken) {
        // User needs to verify email - don't auto-login
        dispatch({ type: "AUTH_FAILURE" });
        // Throw a specific error to indicate email verification is needed
        throw new Error(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập."
        );
      }

      // If user somehow gets tokens (shouldn't happen with new logic)
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      });
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      throw error;
    }
  };
  const logout = async () => {
    try {
      if (state.accessToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${state.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear localStorage immediately and explicitly
      console.log("Clearing localStorage on logout...");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      console.log("localStorage cleared successfully");
      dispatch({ type: "LOGOUT" });
    }
  };
  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: "UPDATE_USER", payload: userData });

    // Update localStorage with new user data
    if (state.user && typeof window !== "undefined") {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const refreshAuth = async () => {
    try {
      if (!state.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.refreshToken}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      // Backend trả về format wrapped: { statusCode, message, data: { user, accessToken, refreshToken, expiresIn, tokenType }, meta, timestamp, path }
      const { data } = result;

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: state.user!,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      });
    } catch (error) {
      dispatch({ type: "LOGOUT" });
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Có lỗi xảy ra khi gửi yêu cầu đặt lại mật khẩu"
        );
      }
    } catch (error) {
      throw error;
    }
  };
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra khi đặt lại mật khẩu");
      }
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Xác minh email thất bại");
      }

      // If verification returns auth tokens, update the auth state
      if (
        result.data &&
        result.data.user &&
        result.data.accessToken &&
        result.data.refreshToken
      ) {
        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user: result.data.user,
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
          },
        });
      }

      return result.data || { message: result.message };
    } catch (error) {
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/resend-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể gửi lại email xác minh");
      }

      return result.data || { message: result.message };
    } catch (error) {
      throw error;
    }
  };
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
