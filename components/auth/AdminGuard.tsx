"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { LoadingSpinner } from "@/components/common/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Nếu chưa đăng nhập, chuyển đến trang login
    if (!isAuthenticated || !user) {
      router.push("/auth/login?redirect=/admin");
      return;
    }    // Nếu không phải admin, chuyển về trang chủ (case-insensitive check)
    if (user.role?.toUpperCase() !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Hiển thị loading khi đang kiểm tra auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle>Cần đăng nhập</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Bạn cần đăng nhập để truy cập trang quản trị.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/auth/login?redirect=/admin">Đăng nhập</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về trang chủ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  // Nếu không phải admin (case-insensitive check)
  if (user.role?.toUpperCase() !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Không có quyền truy cập</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Bạn không có quyền truy cập vào trang quản trị. Chỉ có admin mới
              có thể truy cập khu vực này.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về trang chủ
                </Link>
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-4">
              <p>
                Vai trò hiện tại:{" "}
                <span className="font-medium">{user.role}</span>
              </p>
              <p>
                Email: <span className="font-medium">{user.email}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Nếu là admin, hiển thị children
  return <>{children}</>;
}
