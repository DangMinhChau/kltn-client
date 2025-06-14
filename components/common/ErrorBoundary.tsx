"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

// Error Boundary class component
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
export const DefaultErrorFallback = ({
  error,
  resetError,
}: {
  error?: Error;
  resetError: () => void;
}) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Oops! Có lỗi xảy ra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc quay về trang
            chủ.
          </p>

          {process.env.NODE_ENV === "development" && error && (
            <details className="bg-slate-100 p-3 rounded text-sm">
              <summary className="cursor-pointer font-medium">
                Chi tiết lỗi
              </summary>
              <pre className="mt-2 whitespace-pre-wrap overflow-auto">
                {error.stack || error.message}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Error fallback cho sản phẩm
export const ProductErrorFallback = ({
  resetError,
}: {
  resetError: () => void;
}) => {
  return (
    <Card className="p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="font-semibold mb-2">Không thể tải sản phẩm</h3>
      <p className="text-muted-foreground mb-4">
        Có lỗi xảy ra khi tải danh sách sản phẩm.
      </p>
      <Button onClick={resetError} size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Thử lại
      </Button>
    </Card>
  );
};

// 404 Not Found component
export const NotFound = ({
  title = "Không tìm thấy trang",
  description = "Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.",
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-muted-foreground mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
};

// Network error component
export const NetworkError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <Card className="p-6 text-center">
      <div className="mb-4">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
      </div>
      <h3 className="font-semibold mb-2">Lỗi kết nối</h3>
      <p className="text-muted-foreground mb-4">
        Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của
        bạn.
      </p>
      <Button onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Thử lại
      </Button>
    </Card>
  );
};
