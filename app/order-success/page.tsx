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

  useEffect(() => {
    // Show success toast
    toast.success("Đặt hàng thành công!");
  }, []);

  const handleContinueShopping = () => {
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-600">
            Đặt hàng thành công!
          </CardTitle>
          <p className="text-gray-600">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
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
