"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types";
import { orderApi } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    } else {
      setError("Không tìm thấy thông tin đơn hàng");
      setLoading(false);
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderApi.getOrderByNumber(orderNumber!);
      setOrder(response.data);
    } catch (error: any) {
      console.error("Error fetching order:", error);
      setError("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-600">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng trong thời gian
            sớm nhất.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Thông tin đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Mã đơn hàng:</p>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Trạng thái:</p>
                <Badge variant="outline" className="text-blue-600">
                  {order.status === "pending" ? "Chờ xử lý" : order.status}
                </Badge>
              </div>
              <div>
                <p className="text-gray-600">Ngày đặt:</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Tổng tiền:</p>
                <p className="font-medium text-lg">
                  {formatPrice(order.totalPrice)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Customer Info */}
            <div>
              <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-gray-600">Họ tên:</span>{" "}
                  {order.customerName}
                </p>
                <p>
                  <span className="text-gray-600">Email:</span>{" "}
                  {order.customerEmail}
                </p>
                <p>
                  <span className="text-gray-600">SĐT:</span>{" "}
                  {order.customerPhone}
                </p>
                <p>
                  <span className="text-gray-600">Địa chỉ:</span>{" "}
                  {order.shippingAddress}
                </p>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h4 className="font-medium mb-3">Sản phẩm đã đặt</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-gray-600">
                        {item.colorName} • {item.sizeName} • x{item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Giảm giá {order.voucher ? `(${order.voucher.code})` : ""}:
                  </span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Tổng cộng:</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="flex-1"
          >
            <Home className="mr-2 h-4 w-4" />
            Về trang chủ
          </Button>
          <Button
            onClick={() => router.push("/profile/orders")}
            className="flex-1"
          >
            <Package className="mr-2 h-4 w-4" />
            Xem đơn hàng
          </Button>
        </div>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-2">Thông tin quan trọng</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Đơn hàng sẽ được xử lý trong vòng 1-2 ngày làm việc</li>
              <li>• Thời gian giao hàng dự kiến: 3-5 ngày làm việc</li>
              <li>• Bạn sẽ nhận được email xác nhận và thông tin vận chuyển</li>
              <li>• Liên hệ hotline 1900-xxxx nếu cần hỗ trợ</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
