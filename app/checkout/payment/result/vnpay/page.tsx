"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { paymentApi } from "@/lib/api/orders";

type PaymentStatus = "success" | "failed" | "processing";

export default function VNPayResultPage() {
  const [status, setStatus] = useState<PaymentStatus>("processing");
  const [message, setMessage] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Lấy các tham số từ URL
        const vnpParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          vnpParams[key] = value;
        });

        // Xử lý kết quả thanh toán
        if (!vnpParams.vnp_TxnRef) {
          setStatus("failed");
          setMessage("Không tìm thấy thông tin đơn hàng");
          return;
        }

        // Gọi API để xác nhận thanh toán
        const result = await paymentApi.handlePaymentCallback(
          "vnpay",
          vnpParams
        );

        if (result.success) {
          setStatus("success");
          setMessage("Thanh toán thành công");
          setOrderId(result.orderId || "");
        } else {
          setStatus("failed");
          setMessage(
            "Thanh toán thất bại: " + (result.message || "Lỗi không xác định")
          );
        }
      } catch (error) {
        console.error("Lỗi khi xử lý kết quả thanh toán:", error);
        setStatus("failed");
        setMessage("Đã xảy ra lỗi khi xử lý thanh toán");
      }
    };

    processPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === "processing"
              ? "Đang xử lý thanh toán"
              : status === "success"
              ? "Thanh toán thành công"
              : "Thanh toán thất bại"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {status === "processing" ? (
            <div className="flex flex-col items-center">
              <Loader className="h-16 w-16 text-primary animate-spin" />
              <p className="mt-4 text-center text-gray-600">
                Đang xử lý kết quả thanh toán của bạn...
              </p>
            </div>
          ) : status === "success" ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="mt-4 text-center text-gray-600">{message}</p>
              {orderId && (
                <p className="mt-2 text-center text-sm text-gray-500">
                  Mã đơn hàng: {orderId}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="mt-4 text-center text-gray-600">{message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
            {status === "success" && orderId && (
              <Button
                className="flex-1"
                onClick={() => router.push(`/orders/${orderId}`)}
              >
                Xem chi tiết đơn hàng
              </Button>
            )}
            <Button
              variant={status === "success" ? "outline" : "default"}
              className="flex-1"
              onClick={() => router.push("/")}
            >
              Trở về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
