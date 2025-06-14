"use client";

import React, { useState, useEffect } from "react";
import { orderApi } from "@/lib/api";
import { OrderTracking, OrderStatus } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface OrderTrackingPageProps {
  params: {
    orderNumber: string;
  };
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.orderNumber) {
      fetchTracking();
    }
  }, [params.orderNumber]);

  const fetchTracking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const trackingData = await orderApi.getOrderTracking(params.orderNumber);
      setTracking(trackingData);
    } catch (err) {
      console.error("Failed to fetch tracking:", err);
      setError("Không thể tải thông tin theo dõi đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus, isActive: boolean) => {
    const iconClass = `h-6 w-6 ${
      isActive ? "text-primary" : "text-muted-foreground"
    }`;

    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className={iconClass} />;
      case OrderStatus.CONFIRMED:
        return <CheckCircle className={iconClass} />;
      case OrderStatus.PROCESSING:
        return <Package className={iconClass} />;
      case OrderStatus.SHIPPED:
        return <Truck className={iconClass} />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "Chờ xác nhận";
      case OrderStatus.CONFIRMED:
        return "Đã xác nhận";
      case OrderStatus.PROCESSING:
        return "Đang chuẩn bị hàng";
      case OrderStatus.SHIPPED:
        return "Đang giao hàng";
      case OrderStatus.DELIVERED:
        return "Đã giao hàng";
      case OrderStatus.CANCELLED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const trackingSteps = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <Package className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Không thể theo dõi đơn hàng
            </h1>
            <p className="mt-2 text-gray-600">
              {error || "Thông tin theo dõi không khả dụng"}
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href={`/orders/${params.orderNumber}`}>
                  Xem chi tiết đơn hàng
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = trackingSteps.indexOf(tracking.currentStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4">
            <Link href={`/orders/${params.orderNumber}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại chi tiết đơn hàng
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Theo dõi đơn hàng
              </h1>
              <p className="mt-1 text-gray-600">
                Đơn hàng #{tracking.order.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {tracking.progress}%
              </div>
              <p className="text-sm text-muted-foreground">Hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Tracking Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Progress Bar */}
              <div className="relative">
                <div className="flex items-center justify-between">
                  {trackingSteps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCompleted = index < currentStepIndex;

                    return (
                      <div
                        key={step}
                        className={`flex flex-col items-center relative ${
                          index < trackingSteps.length - 1 ? "flex-1" : ""
                        }`}
                      >
                        {/* Connection Line */}
                        {index < trackingSteps.length - 1 && (
                          <div
                            className={`absolute top-6 left-6 h-0.5 ${
                              isCompleted ? "bg-primary" : "bg-gray-300"
                            }`}
                            style={{
                              width: "calc(100% - 3rem)",
                              right: "-3rem",
                            }}
                          />
                        )}

                        {/* Status Icon */}
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                            isActive
                              ? "border-primary bg-primary text-white"
                              : "border-gray-300 bg-white text-gray-400"
                          } relative z-10`}
                        >
                          {getStatusIcon(step, isActive)}
                        </div>

                        {/* Status Text */}
                        <div className="mt-2 text-center">
                          <p
                            className={`text-sm font-medium ${
                              isActive ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {getStatusText(step)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Events */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Lịch sử cập nhật</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {tracking.events.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {getStatusIcon(event.status, true)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="font-medium">
                        {getStatusText(event.status)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    {event.location && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm trong đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracking.order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border">
                      <Image
                        src={item.product.mainImageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.variant.color.name} • {item.variant.size.name} •
                        SL: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {formatPrice(item.totalPrice)}
                    </div>
                  </div>
                ))}
                {tracking.order.items.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    và {tracking.order.items.length - 3} sản phẩm khác
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {tracking.order.shippingInfo.fullName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{tracking.order.shippingInfo.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">
                  {tracking.order.shippingInfo.address},{" "}
                  {tracking.order.shippingInfo.ward},{" "}
                  {tracking.order.shippingInfo.district},{" "}
                  {tracking.order.shippingInfo.province}
                </span>
              </div>
              {tracking.order.trackingNumber && (
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mã vận đơn</p>
                    <p className="font-mono text-sm">
                      {tracking.order.trackingNumber}
                    </p>
                  </div>
                </div>
              )}
              {tracking.order.estimatedDelivery && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Dự kiến giao hàng
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(
                        tracking.order.estimatedDelivery
                      ).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href={`/orders/${tracking.order.orderNumber}`}>
                Xem chi tiết đơn hàng
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
