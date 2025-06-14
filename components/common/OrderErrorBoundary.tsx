/**
 * Error Boundary cho Order API responses
 * Handles API errors và hiển thị user-friendly error messages
 */

"use client";

import React, { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showRetry?: boolean;
  showGoBack?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class OrderErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error
    console.error("OrderErrorBoundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Đã xảy ra lỗi</CardTitle>
              </div>
              <CardDescription>{this.getErrorMessage()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && this.state.error && (
                <Alert variant="destructive">
                  <AlertTitle>Chi tiết lỗi (Development)</AlertTitle>
                  <AlertDescription className="mt-2">
                    <pre className="text-xs overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                {this.props.showRetry !== false && (
                  <Button
                    onClick={this.handleRetry}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Thử lại
                  </Button>
                )}

                {this.props.showGoBack && (
                  <Button
                    onClick={this.handleGoBack}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }

  private getErrorMessage(): string {
    const error = this.state.error;

    if (!error) {
      return "Có lỗi không xác định xảy ra.";
    }

    // Handle different types of errors
    if (error.name === "OrderApiError") {
      return error.message || "Lỗi API đơn hàng.";
    }

    if (error.message.includes("fetch")) {
      return "Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.";
    }

    if (
      error.message.includes("unauthorized") ||
      error.message.includes("401")
    ) {
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    }

    if (error.message.includes("forbidden") || error.message.includes("403")) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }

    if (error.message.includes("not found") || error.message.includes("404")) {
      return "Không tìm thấy thông tin yêu cầu.";
    }

    if (error.message.includes("server") || error.message.includes("500")) {
      return "Lỗi server nội bộ. Vui lòng thử lại sau.";
    }

    return error.message || "Đã xảy ra lỗi không xác định.";
  }
}

// Hook để sử dụng error boundary dễ hơn
export function useOrderErrorHandler() {
  const handleError = (error: unknown, context?: string) => {
    console.error(`Order Error ${context ? `in ${context}` : ""}:`, error);

    // Có thể thêm error reporting service ở đây
    // Ví dụ: Sentry, LogRocket, etc.
  };

  return { handleError };
}

// Higher-order component để wrap components với error boundary
export function withOrderErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  return function WrappedComponent(props: P) {
    return (
      <OrderErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </OrderErrorBoundary>
    );
  };
}

export default OrderErrorBoundary;
