/**
 * Suspense Loading Components for Order-related pages
 * Provides consistent loading UI across order pages
 */

import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Package, ShoppingCart, CreditCard } from "lucide-react";

// Generic loading spinner
export function OrderLoadingSpinner({
  message = "Đang tải...",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Order list loading skeleton
export function OrderListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Order detail loading skeleton
export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Order header */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Order items */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 pb-4 border-b last:border-b-0"
              >
                <Skeleton className="h-20 w-20 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order summary */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Order tracking loading skeleton
export function OrderTrackingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Checkout loading skeleton
export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Shipping info */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 p-3 border rounded"
                >
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order summary sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}

              <div className="space-y-2 pt-4 border-t">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-10 w-full mt-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Higher-order component to wrap order pages with Suspense
export function withOrderSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <OrderLoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Loading components with icons for different contexts
export function OrderListLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Package className="h-12 w-12 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h3 className="font-medium">Đang tải đơn hàng</h3>
        <p className="text-sm text-muted-foreground">
          Vui lòng đợi trong giây lát...
        </p>
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function CheckoutLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h3 className="font-medium">Đang xử lý thanh toán</h3>
        <p className="text-sm text-muted-foreground">
          Hệ thống đang chuẩn bị đơn hàng của bạn...
        </p>
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function PaymentLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <CreditCard className="h-12 w-12 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h3 className="font-medium">Đang xử lý thanh toán</h3>
        <p className="text-sm text-muted-foreground">
          Vui lòng không đóng trình duyệt...
        </p>
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default {
  OrderLoadingSpinner,
  OrderListSkeleton,
  OrderDetailSkeleton,
  OrderTrackingSkeleton,
  CheckoutSkeleton,
  withOrderSuspense,
  OrderListLoading,
  CheckoutLoading,
  PaymentLoading,
};
