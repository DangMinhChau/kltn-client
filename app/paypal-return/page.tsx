"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useCart } from "@/lib/context";

function PayPalReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  useEffect(() => {
    const handlePayPalReturn = async () => {
      const paypalOrderId = searchParams.get("token");
      const payerId = searchParams.get("PayerID");
      const orderIdParam = searchParams.get("orderId");

      console.log("PayPal return URL params:", {
        paypalOrderId,
        payerId,
        orderIdParam,
        allParams: Object.fromEntries(searchParams.entries()),
        fullUrl: window.location.href,
      });

      // Check if this is a cancelled payment
      if (searchParams.get("cancelled") === "true") {
        setStatus("error");
        toast.error("Thanh toán PayPal đã bị hủy");
        return;
      }

      if (!paypalOrderId) {
        console.error("Missing PayPal token (order ID)");
        setStatus("error");
        toast.error("Thiếu thông tin thanh toán PayPal - token");
        return;
      }

      if (!payerId) {
        console.error("Missing PayerID - payment may not be completed");
        setStatus("error");
        toast.error("Thanh toán chưa được hoàn thành - thiếu PayerID");
        return;
      }

      if (!orderIdParam) {
        console.error("Missing internal order ID");
        setStatus("error");
        toast.error("Thiếu Order ID nội bộ");
        return;
      }

      console.log("All validation passed, proceeding with capture...");
      try {
        // Capture PayPal payment
        console.log("Sending capture request...");
        const response = await api.post("/payments/paypal/capture-order", {
          paypalOrderId,
          payerId,
          orderId: orderIdParam,
        });
        console.log("Capture response received:", {
          status: response.status,
          data: response.data,
          hasSuccess: "success" in response.data,
          dataType: typeof response.data,
        }); // Backend returns BaseResponseDto format: { message, data, meta }        // Check if request was successful (status 2xx) since backend logs show success
        if (response.status >= 200 && response.status < 300) {
          clearCart();
          // Redirect immediately to order success page
          router.push(
            `/order-success?orderId=${orderIdParam}&paymentMethod=paypal`
          );
        } else {
          console.error("Non-2xx response status:", response.status);
          setStatus("error");
          toast.error("Thanh toán PayPal thất bại");
        }
      } catch (error) {
        console.error("PayPal capture error:", error);
        setStatus("error");
        toast.error("Có lỗi xảy ra khi xử lý thanh toán PayPal");
      }
    };

    handlePayPalReturn();
  }, [searchParams, router, clearCart]);

  const handleRetryCheckout = () => {
    router.push("/checkout");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          {" "}
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            {status === "processing" && (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Đang xử lý thanh toán...
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                Thanh toán thất bại
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {" "}
          {status === "processing" && (
            <div>
              <p className="text-muted-foreground">
                Vui lòng đợi trong khi chúng tôi xử lý thanh toán PayPal của
                bạn...
              </p>{" "}
            </div>
          )}
          {status === "error" && (
            <div className="space-y-4">
              <p className="text-red-600">
                Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
              </p>
              <div className="flex gap-4 justify-center">
                {" "}
                <Button onClick={handleRetryCheckout} variant="default">
                  Thử lại thanh toán
                </Button>
                <Button onClick={handleGoHome} variant="outline">
                  Về trang chủ
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PayPalReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Đang xử lý thanh toán...</p>
          </div>
        </div>
      }
    >
      <PayPalReturnContent />
    </Suspense>
  );
}
