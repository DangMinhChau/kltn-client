"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

export default function OrderPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const paypalOrderId = searchParams.get("paypalOrderId");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // If no order number, redirect to home
    if (!orderNumber) {
      router.push("/");
    }
  }, [orderNumber, router]);

  const checkPaymentStatus = async () => {
    if (!orderNumber) return;

    try {
      setIsChecking(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderNumber}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        const orderData = await response.json();
        if (orderData.data?.isPaid) {
          toast.success("Thanh toán thành công!");
          router.push(`/order-success?orderNumber=${orderNumber}`);
        } else {
          toast.info("Đơn hàng chưa được thanh toán");
        }
      }
    } catch (error) {
      console.error("Failed to check payment status:", error);
      toast.error("Có lỗi xảy ra khi kiểm tra trạng thái thanh toán");
    } finally {
      setIsChecking(false);
    }
  };

  const openPayPalCheckout = () => {
    if (paypalOrderId) {
      const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${paypalOrderId}`;
      window.open(paypalUrl, "_blank");
    }
  };

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-yellow-600">
              Đang chờ thanh toán
            </CardTitle>
            <p className="text-muted-foreground">
              Đơn hàng của bạn đã được tạo và đang chờ thanh toán PayPal.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
              <p className="font-mono font-medium text-lg">{orderNumber}</p>
            </div>

            {paypalOrderId && (
              <div className="p-4 border-2 border-dashed border-yellow-300 rounded-lg bg-yellow-50">
                <p className="font-medium text-yellow-800 mb-2">
                  Hoàn tất thanh toán PayPal
                </p>
                <p className="text-sm text-yellow-700 mb-4">
                  Nhấn vào nút bên dưới để mở lại cửa sổ thanh toán PayPal và
                  hoàn tất giao dịch.
                </p>
                <Button
                  onClick={openPayPalCheckout}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Mở PayPal
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div className="text-left">
                  <p className="font-medium">Chờ thanh toán</p>
                  <p className="text-sm text-muted-foreground">
                    Đơn hàng sẽ được xử lý sau khi thanh toán thành công
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sau khi hoàn tất thanh toán PayPal, bạn có thể kiểm tra lại
                trạng thái đơn hàng hoặc chờ hệ thống tự động cập nhật.
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={checkPaymentStatus}
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Kiểm tra lại
                    </>
                  )}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/products">Tiếp tục mua sắm</Link>
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                Nếu bạn gặp vấn đề với thanh toán, vui lòng liên hệ với chúng
                tôi qua email hoặc số điện thoại hỗ trợ.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
