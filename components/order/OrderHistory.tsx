"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { orderApi } from "@/lib/api/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Eye,
  CalendarDays,
  Truck,
  CreditCard,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface OrderItem {
  id: string;
  quantity?: number;
  unitPrice?: number;
  variant: {
    id: string;
    sku: string;
    product: {
      id: string;
      name: string;
      slug: string;
    };
    color?: {
      name: string;
    };
    size?: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount?: number;
  totalPrice?: number; // Backend might use this field name
  subTotal: number;
  shippingFee: number;
  discount?: number;
  createdAt: string;
  completedAt?: string;
  canceledAt?: string;
  items: OrderItem[];
  payment?: {
    method: string;
    status: string;
  };
  shipping?: {
    method: string;
    status: string;
    trackingNumber?: string;
  };
}

interface OrderHistoryMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Order status mapping
const orderStatusMap = {
  PENDING: { label: "Chờ xử lý", variant: "secondary" as const },
  CONFIRMED: { label: "Đã xác nhận", variant: "default" as const },
  PREPARING: { label: "Đang chuẩn bị", variant: "default" as const },
  SHIPPING: { label: "Đang giao", variant: "default" as const },
  COMPLETED: { label: "Hoàn thành", variant: "default" as const },
  CANCELLED: { label: "Đã hủy", variant: "destructive" as const },
  REFUNDED: { label: "Đã hoàn tiền", variant: "secondary" as const },
};

const paymentStatusMap = {
  PENDING: { label: "Chờ thanh toán", variant: "secondary" as const },
  PAID: { label: "Đã thanh toán", variant: "default" as const },
  FAILED: { label: "Thanh toán thất bại", variant: "destructive" as const },
  REFUNDED: { label: "Đã hoàn tiền", variant: "secondary" as const },
};

export default function OrderHistory() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<OrderHistoryMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Load orders
  const loadOrders = async (page = 1, status?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit: 10,
      };

      if (status) {
        params.status = status;
      }

      const response = await orderApi.getUserOrders(params);
      setOrders(response.data);
      setMeta(response.meta);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || "Không thể tải lịch sử đơn hàng");
      toast.error("Lỗi tải dữ liệu", {
        description: err.message || "Không thể tải lịch sử đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  };
  // Initial load
  useEffect(() => {
    loadOrders(1, undefined); // Load all orders initially
  }, []);
  // Handle filter change
  const handleStatusFilter = (status: string) => {
    const actualStatus = status === "all" ? "" : status;
    setStatusFilter(actualStatus);
    loadOrders(1, actualStatus || undefined);
  };
  // Handle page change
  const handlePageChange = (page: number) => {
    const actualStatus = statusFilter === "all" ? undefined : statusFilter;
    loadOrders(page, actualStatus);
  };
  // Format currency
  const formatCurrency = (amount: number | string | null | undefined) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (!numAmount || isNaN(numAmount)) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numAmount);
  };

  // Get order status badge
  const getOrderStatusBadge = (status: string) => {
    const statusInfo = orderStatusMap[
      status as keyof typeof orderStatusMap
    ] || {
      label: status,
      variant: "secondary" as const,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    const statusInfo = paymentStatusMap[
      status as keyof typeof paymentStatusMap
    ] || {
      label: status,
      variant: "secondary" as const,
    };
    return (
      <Badge variant={statusInfo.variant} className="text-xs">
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        {/* Filter skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Orders skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadOrders(currentPage, statusFilter || undefined)}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Lọc theo trạng thái:</span>
        </div>{" "}
        <Select
          value={statusFilter || "all"}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả đơn hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả đơn hàng</SelectItem>
            <SelectItem value="PENDING">Chờ xử lý</SelectItem>
            <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem value="PREPARING">Đang chuẩn bị</SelectItem>
            <SelectItem value="SHIPPING">Đang giao</SelectItem>
            <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
        {/* Summary */}
        <div className="ml-auto text-sm text-muted-foreground">
          Tổng {meta.total} đơn hàng
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-muted-foreground text-center mb-6">
              Bạn chưa có đơn hàng nào. Hãy khám phá và mua sắm ngay!
            </p>
            <Button asChild>
              <Link href="/products">Mua sắm ngay</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      Đơn hàng #{order.orderNumber}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {order.items.length} sản phẩm
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getOrderStatusBadge(order.status)}{" "}
                    <div className="text-lg font-semibold text-primary">
                      {formatCurrency(
                        order.totalAmount || order.totalPrice || 0
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Items Preview */}
                <div className="space-y-2">
                  {order.items.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex-1">
                        <span className="font-medium">
                          {item.variant.product.name}
                        </span>
                        {(item.variant.color || item.variant.size) && (
                          <span className="text-muted-foreground ml-2">
                            (
                            {[item.variant.color?.name, item.variant.size?.name]
                              .filter(Boolean)
                              .join(", ")}
                            )
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        x{item.quantity}
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      và {order.items.length - 2} sản phẩm khác...
                    </div>
                  )}
                </div>

                {/* Payment and Shipping Info */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm">
                    {order.payment && (
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        <span>{order.payment.method}</span>
                        {getPaymentStatusBadge(order.payment.status)}
                      </div>
                    )}
                    {order.shipping && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        <span>{order.shipping.method}</span>
                        {order.shipping.trackingNumber && (
                          <span className="text-muted-foreground">
                            (#{order.shipping.trackingNumber})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages || loading}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
