/**
 * Enhanced Order Details Component
 * Using new types and error handling
 */

"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { OrderErrorBoundary } from "@/components/common/OrderErrorBoundary";
import {
  useOrderManager,
  useOrderTracking,
  useRetryPayment,
} from "@/hooks/useEnhancedOrder";

import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingStatus,
} from "@/types/order";

interface OrderDetailsPageProps {
  isAdmin?: boolean;
}

function OrderDetailsContent({ isAdmin = false }: OrderDetailsPageProps) {
  const params = useParams();
  const orderId = params.id as string;

  const {
    order,
    isLoading,
    error,
    canCancel,
    canRetryPayment,
    updateStatus,
    cancelOrder,
    retryPayment,
    isUpdating,
    isCancelling,
    isRetryingPayment,
  } = useOrderManager(orderId);

  const { data: trackingData } = useOrderTracking(orderId, !!order);

  const [cancelReason, setCancelReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [statusNote, setStatusNote] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    throw error; // Will be caught by ErrorBoundary
  }

  if (!order) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Không tìm thấy đơn hàng với ID: {orderId}
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusColor = (
    status: OrderStatus | PaymentStatus | ShippingStatus
  ) => {
    switch (status) {
      case OrderStatus.PENDING:
      case PaymentStatus.PENDING:
      case ShippingStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case OrderStatus.CONFIRMED:
      case OrderStatus.PROCESSING:
      case ShippingStatus.PICKING:
      case ShippingStatus.IN_TRANSIT:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.SHIPPED:
      case OrderStatus.DELIVERED:
      case OrderStatus.COMPLETED:
      case PaymentStatus.PAID:
      case ShippingStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case OrderStatus.CANCELLED:
      case PaymentStatus.CANCELLED:
      case PaymentStatus.FAILED:
      case ShippingStatus.CANCELLED:
      case ShippingStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-4 w-4" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="h-4 w-4" />;
      case OrderStatus.PROCESSING:
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleUpdateStatus = () => {
    if (selectedStatus) {
      updateStatus(selectedStatus as OrderStatus, statusNote);
      setSelectedStatus("");
      setStatusNote("");
    }
  };

  const handleCancelOrder = () => {
    cancelOrder(cancelReason);
    setCancelReason("");
  };

  const handleRetryPayment = (method: PaymentMethod) => {
    retryPayment(method);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng #{order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Đặt ngày {new Date(order.orderedAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(order.status)}
          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Thông tin đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Mã đơn hàng:</p>
                <p className="text-muted-foreground">{order.orderNumber}</p>
              </div>
              <div>
                <p className="font-medium">Trạng thái:</p>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Tổng tiền:</p>
                <p className="font-semibold text-lg">
                  {order.totalPrice.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <div>
                <p className="font-medium">Phí vận chuyển:</p>
                <p>{order.shippingFee.toLocaleString("vi-VN")}₫</p>
              </div>
            </div>

            {order.note && (
              <div>
                <p className="font-medium">Ghi chú:</p>
                <p className="text-muted-foreground">{order.note}</p>
              </div>
            )}

            {/* Order Items */}
            <Separator />
            <div>
              <h4 className="font-medium mb-2">
                Sản phẩm ({order.items.length})
              </h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.colorName} - {item.sizeName} - SKU:{" "}
                        {item.variantSku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.unitPrice.toLocaleString("vi-VN")}₫ x{" "}
                        {item.quantity}
                      </p>
                      <p className="text-sm font-semibold">
                        {(
                          item.totalPrice ||
                          0 ||
                          item.unitPrice * item.quantity
                        ).toLocaleString("vi-VN")}
                        ₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer & Shipping Information */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
                <p className="text-muted-foreground">{order.customerPhone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{order.shippingAddress}</p>
              {order.shipping && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Mã vận đơn:</span>{" "}
                    {order.shipping.trackingNumber}
                  </p>
                  <Badge
                    className={getStatusColor(
                      order.shipping.status as ShippingStatus
                    )}
                  >
                    {order.shipping.status}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Thông tin thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.payment ? (
                <div>
                  <div className="flex justify-between items-center">
                    <span>Phương thức:</span>
                    <span>{order.payment.method}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Trạng thái:</span>
                    <Badge
                      className={getStatusColor(
                        order.payment.status as PaymentStatus
                      )}
                    >
                      {order.payment.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Số tiền:</span>
                    <span className="font-semibold">
                      {order.payment.amount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  {order.payment.transactionId && (
                    <div className="flex justify-between items-center">
                      <span>Mã giao dịch:</span>
                      <span className="text-xs font-mono">
                        {order.payment.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Chưa có thông tin thanh toán
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tracking Information */}
      {trackingData?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Theo dõi vận chuyển
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Trạng thái:</span>
                <Badge>{trackingData.data.status}</Badge>
              </div>
              <p>{trackingData.data.statusDescription}</p>

              {trackingData.data.trackingHistory &&
                trackingData.data.trackingHistory.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Lịch sử vận chuyển:</h4>
                    <div className="space-y-2">
                      {trackingData.data.trackingHistory.map((event, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium">{event.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.location}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.time).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Thao tác quản lý</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {/* Update Status */}
              <div className="flex gap-2">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OrderStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={!selectedStatus || isUpdating}
                >
                  {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>

              {/* Cancel Order */}
              {canCancel && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Hủy đơn hàng</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hủy đơn hàng</DialogTitle>
                      <DialogDescription>
                        Bạn có chắc chắn muốn hủy đơn hàng này?
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="Lý do hủy đơn hàng (tùy chọn)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={handleCancelOrder}
                        disabled={isCancelling}
                      >
                        {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {statusNote && (
              <Textarea
                placeholder="Ghi chú trạng thái (tùy chọn)"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Customer Actions */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Thao tác</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {/* Retry Payment */}
              {canRetryPayment && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Thanh toán thất bại, thử lại với:
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRetryPayment(PaymentMethod.VNPAY)}
                      disabled={isRetryingPayment}
                    >
                      VNPay
                    </Button>
                    <Button
                      onClick={() => handleRetryPayment(PaymentMethod.COD)}
                      disabled={isRetryingPayment}
                      variant="outline"
                    >
                      COD
                    </Button>
                  </div>
                </div>
              )}

              {/* Cancel Order */}
              {canCancel && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Hủy đơn hàng</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hủy đơn hàng</DialogTitle>
                      <DialogDescription>
                        Bạn có chắc chắn muốn hủy đơn hàng này?
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="Lý do hủy đơn hàng (tùy chọn)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={handleCancelOrder}
                        disabled={isCancelling}
                      >
                        {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function OrderDetailsPage(props: OrderDetailsPageProps) {
  return (
    <OrderErrorBoundary
      showRetry
      showGoBack
      onError={(error, errorInfo) => {
        console.error("Order Details Error:", error, errorInfo);
        // Send to error reporting service
      }}
    >
      <OrderDetailsContent {...props} />
    </OrderErrorBoundary>
  );
}
