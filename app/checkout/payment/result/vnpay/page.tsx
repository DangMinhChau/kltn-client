"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentResult {
  success: boolean;
  message: string;
  orderId?: string;
  amount?: number;
  transactionId?: string;
}

function VNPayResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Lấy tất cả params từ VNPay
        const vnpParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          vnpParams[key] = value;
        });

        // Gửi callback về backend để xử lý
        const response = await fetch("/api/payments/vnpay/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(vnpParams),
        });

        const data = await response.json();

        if (response.ok) {
          setResult({
            success: true,
            message: "Thanh toán thành công!",
            orderId: vnpParams.vnp_TxnRef,
            amount: parseInt(vnpParams.vnp_Amount) / 100,
            transactionId: vnpParams.vnp_TransactionNo,
          });
          toast.success("Thanh toán thành công!");
        } else {
          setResult({
            success: false,
            message: data.message || "Thanh toán thất bại",
          });
          toast.error("Thanh toán thất bại");
        }
      } catch (error) {
        console.error("Error processing payment result:", error);
        setResult({
          success: false,
          message: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
        });
        toast.error("Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.get("vnp_ResponseCode")) {
      processPaymentResult();
    } else {
      setLoading(false);
      setResult({
        success: false,
        message: "Không tìm thấy thông tin thanh toán",
      });
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {result?.success ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-xl">
            {result?.success ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <p>{result?.message}</p>
          </div>

          {result?.success && result.orderId && (
            <div className="space-y-2 p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">Mã đơn hàng:</span>
                <span>{result.orderId}</span>
              </div>
              {result.amount && (
                <div className="flex justify-between">
                  <span className="font-medium">Số tiền:</span>
                  <span>{result.amount.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              )}
              {result.transactionId && (
                <div className="flex justify-between">
                  <span className="font-medium">Mã giao dịch:</span>
                  <span>{result.transactionId}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {result?.success ? (
              <>
                <Button
                  onClick={() => router.push(`/order/${result.orderId}`)}
                  className="w-full"
                >
                  Xem chi tiết đơn hàng
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  Về trang chủ
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/checkout")}
                  className="w-full"
                >
                  Thử lại thanh toán
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/cart")}
                  className="w-full"
                >
                  Quay về giỏ hàng
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>    </div>
  );
}

export default function VNPayResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang tải...</p>
        </div>
      </div>
    }>
      <VNPayResultContent />
    </Suspense>
  );
}
