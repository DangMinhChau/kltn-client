"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

interface VerifyEmailFormData {
  token: string;
}

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [message, setMessage] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerificationEmail } = useAuth();

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      handleVerifyEmail(token);
    }
  }, [token]);

  const handleVerifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      const response = await verifyEmail(verificationToken);
      setVerificationStatus("success");
      setMessage(response.message || "Email đã được xác minh thành công!");

      // Redirect to login or dashboard after successful verification
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error: any) {
      setVerificationStatus("error");
      setMessage(error.message || "Xác minh email thất bại. Vui lòng thử lại.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    const email = prompt("Vui lòng nhập email của bạn:");
    if (!email) return;

    setIsResending(true);
    setResendMessage("");

    try {
      await resendVerificationEmail(email);
      setResendMessage(
        "Email xác minh mới đã được gửi. Vui lòng kiểm tra hộp thư của bạn."
      );
    } catch (error: any) {
      setResendMessage(error.message || "Không thể gửi lại email xác minh.");
    } finally {
      setIsResending(false);
    }
  };

  const renderVerificationStatus = () => {
    if (isVerifying) {
      return (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang xác minh email của bạn...</p>
        </div>
      );
    }

    if (verificationStatus === "success") {
      return (
        <div className="text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {message}
            </AlertDescription>
          </Alert>
          <p className="text-gray-600 mb-4">
            Bạn sẽ được chuyển hướng đến trang đăng nhập trong 3 giây...
          </p>
          <Link href="/auth/login">
            <Button className="w-full">Đăng nhập ngay</Button>
          </Link>
        </div>
      );
    }

    if (verificationStatus === "error") {
      return (
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <div className="space-y-3">
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full"
              variant="outline"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi lại...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Gửi lại email xác minh
                </>
              )}
            </Button>

            {resendMessage && (
              <Alert
                className={
                  resendMessage.includes("đã được gửi")
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }
              >
                <AlertDescription
                  className={
                    resendMessage.includes("đã được gửi")
                      ? "text-green-800"
                      : "text-red-800"
                  }
                >
                  {resendMessage}
                </AlertDescription>
              </Alert>
            )}

            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    // No token provided
    return (
      <div className="text-center">
        <Mail className="h-16 w-16 mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold mb-2">Xác minh email</h3>
        <p className="text-gray-600 mb-4">
          Vui lòng kiểm tra email của bạn và nhấn vào liên kết xác minh.
        </p>
        <div className="space-y-3">
          <Button
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full"
            variant="outline"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi lại...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Gửi lại email xác minh
              </>
            )}
          </Button>

          {resendMessage && (
            <Alert
              className={
                resendMessage.includes("đã được gửi")
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <AlertDescription
                className={
                  resendMessage.includes("đã được gửi")
                    ? "text-green-800"
                    : "text-red-800"
                }
              >
                {resendMessage}
              </AlertDescription>
            </Alert>
          )}

          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Quay lại đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Xác minh Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            Hoàn tất việc xác minh email để kích hoạt tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>{renderVerificationStatus()}</CardContent>
      </Card>
    </div>
  );
}

export const VerifyEmailForm = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Đang tải...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
};
