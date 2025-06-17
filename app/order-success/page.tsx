"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  useEffect(() => {
    // If no order number, redirect to home
    if (!orderNumber) {
      router.push("/");
    }
  }, [orderNumber, router]);

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Đặt hàng thành công!
            </CardTitle>
            <p className="text-muted-foreground">
              Cảm ơn bạn đã đặt hàng. Chúng tôi đã nhận được đơn hàng của bạn.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
              <p className="font-mono font-medium text-lg">{orderNumber}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Đơn hàng đang được xử lý</p>
                  <p className="text-sm text-muted-foreground">
                    Chúng tôi sẽ xác nhận và chuẩn bị đơn hàng của bạn
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg opacity-60">
                <Truck className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <p className="font-medium">Giao hàng</p>
                  <p className="text-sm text-muted-foreground">
                    Đơn hàng sẽ được giao trong 2-3 ngày làm việc
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Thông tin chi tiết đơn hàng đã được gửi tới email của bạn. Bạn
                có thể theo dõi tình trạng đơn hàng trong tài khoản.
              </p>

              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href="/products">Tiếp tục mua sắm</Link>
                </Button>
                <Button asChild>
                  <Link href="/profile/orders">Xem đơn hàng</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
