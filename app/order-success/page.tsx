"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentMethod = searchParams.get("paymentMethod");
  useEffect(() => {
    // Show success toast based on payment method
    if (paymentMethod === "paypal") {
      toast.success("Thanh toán PayPal thành công!");
    } else if (paymentMethod === "cod") {
      toast.success("Đặt hàng COD thành công!");
    } else {
      // Fallback for any other case
      toast.success("Đặt hàng thành công!");
    }
  }, [paymentMethod]);

  const handleContinueShopping = () => {
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        {" "}
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-600">
            {paymentMethod === "paypal"
              ? "Thanh toán thành công!"
              : "Đặt hàng thành công!"}
          </CardTitle>
          <p className="text-gray-600">
            {paymentMethod === "paypal"
              ? "Cảm ơn bạn! Thanh toán PayPal đã được xử lý thành công."
              : "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý."}
          </p>
        </CardHeader>
        <CardContent className="text-center">
          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Mã đơn hàng: <span className="font-mono">{orderId}</span>
            </p>
          )}
          <Button onClick={handleContinueShopping} className="w-full">
            Tiếp tục mua sắm
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </CardContent>
          </Card>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
