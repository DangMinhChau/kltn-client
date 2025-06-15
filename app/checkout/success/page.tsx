"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { orderApi } from "@/lib/api";
import { Order } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  Home,
  ShoppingBag,
  Share2,
  Download,
  Calendar,
  CreditCard,
  Gift,
  Star,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const isSuccess = searchParams.get("success") === "true";

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (params.orderNumber && typeof params.orderNumber === "string") {
      fetchOrder();
    }
  }, [params.orderNumber]);

  useEffect(() => {
    // Trigger confetti animation on success
    if (isSuccess && order) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"],
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, order]);
  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const orderData = await orderApi.getOrderByNumber(
        params.orderNumber as string
      );
      setOrder(orderData.data); // Extract data from BaseResponseDto
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Không thể tải thông tin đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const shareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Đơn hàng #${params.orderNumber}`,
          text: `Tôi vừa đặt hàng thành công tại Men's Fashion!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Đã sao chép liên kết!");
      } catch (err) {
        console.log("Error copying to clipboard:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center">
              <Skeleton className="mx-auto h-20 w-20 rounded-full mb-6" />
              <Skeleton className="mx-auto h-8 w-64 mb-4" />
              <Skeleton className="mx-auto h-4 w-96" />
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <Package className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Không tìm thấy đơn hàng
            </h1>
            <p className="mt-2 text-gray-600">
              {error || "Đơn hàng không tồn tại hoặc đã bị xóa"}
            </p>
            <div className="mt-6 space-x-4">
              <Button asChild>
                <Link href="/">Về trang chủ</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products">Mua sắm tiếp</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Header */}
        {isSuccess && (
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-lg animate-pulse">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎉 Đặt hàng thành công!
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Cảm ơn bạn đã tin tưởng và mua hàng tại{" "}
              <span className="font-semibold text-primary">Men's Fashion</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button onClick={shareOrder} variant="outline" className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Tải hóa đơn
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Package className="h-6 w-6 text-primary" />
                      Đơn hàng #{order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Đặt ngày{" "}
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      {order.status}
                    </Badge>{" "}
                    <Badge variant="outline" className="bg-blue-50">
                      {order.payment?.status || "N/A"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Details */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Chi tiết đơn hàng
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Số lượng sản phẩm:
                        </span>
                        <span className="font-medium">
                          {order.items.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Phương thức thanh toán:
                        </span>{" "}
                        <span className="font-medium">
                          {order.payment?.method === "cod" &&
                            "Thanh toán khi nhận hàng"}
                          {order.payment?.method === "bank_transfer" &&
                            "Chuyển khoản"}
                          {order.payment?.method === "momo" && "Ví MoMo"}
                          {order.payment?.method === "vnpay" && "VNPay"}
                        </span>
                      </div>{" "}
                      {order.shipping?.expectedDeliveryDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Dự kiến giao hàng:
                          </span>
                          <span className="font-medium text-primary">
                            {new Date(
                              order.shipping.expectedDeliveryDate
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Thông tin giao hàng
                    </h3>{" "}
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">{order.customerName}</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{order.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{order.customerEmail}</span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3 mt-0.5" />
                        <span>{order.shippingAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Sản phẩm đã đặt ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex gap-4 py-4 ${
                        index !== order.items.length - 1 ? "border-b" : ""
                      } hover:bg-gray-50/50 rounded-lg transition-colors px-2`}
                    >
                      {" "}
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border shadow-sm">
                        <Image
                          src="/placeholder-image.jpg"
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {item.productName}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-1">
                          {item.colorName} • {item.sizeName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          {formatPrice(item.totalPrice || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.unitPrice)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Total */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Tổng thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                {" "}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{formatPrice(order.subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Phí vận chuyển:
                    </span>
                    <span>
                      {order.shippingFee > 0
                        ? formatPrice(order.shippingFee)
                        : "Miễn phí"}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href={`/orders/${order.orderNumber}/tracking`}>
                  <Truck className="mr-2 h-5 w-5" />
                  Theo dõi đơn hàng
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full" size="lg">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Tiếp tục mua sắm
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full" size="lg">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Về trang chủ
                </Link>
              </Button>
            </div>

            {/* Next Steps */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Tiếp theo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Bạn sẽ nhận email xác nhận đơn hàng trong vài phút</p>
                <p>• Đơn hàng sẽ được xử lý trong 1-2 ngày làm việc</p>
                <p>• Theo dõi trạng thái qua email hoặc trang web</p>
                <p>• Đánh giá sản phẩm sau khi nhận hàng để nhận điểm thưởng</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
