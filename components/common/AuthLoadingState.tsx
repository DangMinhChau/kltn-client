"use client";

import React from "react";
import { Loader2, Shield, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AuthLoadingStateProps {
  type?: "login" | "register" | "verify" | "reset" | "general";
  message?: string;
  submessage?: string;
  progress?: number;
}

const loadingMessages = {
  login: {
    message: "Đang đăng nhập...",
    submessage: "Vui lòng chờ trong giây lát",
    icon: Shield,
  },
  register: {
    message: "Đang tạo tài khoản...",
    submessage: "Chúng tôi đang thiết lập tài khoản của bạn",
    icon: CheckCircle,
  },
  verify: {
    message: "Đang xác thực email...",
    submessage: "Kiểm tra mã xác thực",
    icon: Shield,
  },
  reset: {
    message: "Đang đặt lại mật khẩu...",
    submessage: "Cập nhật thông tin bảo mật",
    icon: Shield,
  },
  general: {
    message: "Đang xử lý...",
    submessage: "Vui lòng chờ trong giây lát",
    icon: Loader2,
  },
};

export const AuthLoadingState: React.FC<AuthLoadingStateProps> = ({
  type = "general",
  message,
  submessage,
  progress,
}) => {
  const config = loadingMessages[type];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            {/* Loading Icon */}
            <div className="relative">
              <IconComponent
                className="h-12 w-12 text-blue-600 animate-spin"
                aria-hidden="true"
              />
              {type !== "general" && (
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse" />
              )}
            </div>

            {/* Progress Bar */}
            {progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}

            {/* Messages */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {message || config.message}
              </h3>
              <p className="text-sm text-gray-600">
                {submessage || config.submessage}
              </p>
            </div>

            {/* Loading Animation */}
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for enhanced loading states
export const useAuthLoading = () => {
  const [loadingState, setLoadingState] = React.useState<{
    isLoading: boolean;
    type?: AuthLoadingStateProps["type"];
    message?: string;
    submessage?: string;
    progress?: number;
  }>({
    isLoading: false,
  });

  const startLoading = (config?: Partial<AuthLoadingStateProps>) => {
    setLoadingState({
      isLoading: true,
      ...config,
    });
  };

  const updateProgress = (progress: number) => {
    setLoadingState((prev) => ({
      ...prev,
      progress,
    }));
  };

  const stopLoading = () => {
    setLoadingState({
      isLoading: false,
    });
  };

  return {
    ...loadingState,
    startLoading,
    updateProgress,
    stopLoading,
  };
};

export default AuthLoadingState;
