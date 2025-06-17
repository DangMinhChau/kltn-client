"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, Home } from "lucide-react";

export default function PayPalCancelPage() {
  const router = useRouter();

  const handleRetryCheckout = () => {
    router.push("/checkout");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleBackToCart = () => {
    router.push("/cart");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-orange-600">
            <XCircle className="h-6 w-6" />
            Thanh toán đã bị hủy
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Bạn đã hủy quá trình thanh toán PayPal.
            </p>
            <p className="text-sm text-muted-foreground">
              Đơn hàng của bạn vẫn được lưu trong giỏ hàng và bạn có thể tiếp
              tục thanh toán bất cứ lúc nào.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRetryCheckout} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại thanh toán
            </Button>

            <Button
              onClick={handleBackToCart}
              variant="outline"
              className="gap-2"
            >
              Xem giỏ hàng
            </Button>

            <Button onClick={handleGoHome} variant="ghost" className="gap-2">
              <Home className="h-4 w-4" />
              Về trang chủ
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <p className="font-medium text-blue-900 mb-1">💡 Gợi ý:</p>
            <p className="text-blue-700">
              Bạn cũng có thể chọn thanh toán khi nhận hàng (COD) nếu không muốn
              thanh toán trực tuyến.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
