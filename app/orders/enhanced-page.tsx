/**
 * Enhanced Orders Page with Server Actions and Improved UX
 * Uses Next.js 14+ features: Server Actions, Suspense, Error Boundaries
 */

"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Search,
  Filter,
  Calendar,
  ShoppingBag,
  Truck,
  CheckCircle,
  X,
  Eye,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

// Import enhanced types and server actions
import {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingStatus,
} from "@/types";
import {
  getOrderHistoryAction,
  cancelOrderAction,
  revalidateOrderCaches,
} from "@/lib/actions/order-actions";
import OrderErrorBoundary from "@/components/common/OrderErrorBoundary";
import {
  OrderListSkeleton,
  OrderListLoading,
  withOrderSuspense,
} from "@/components/common/OrderSuspense";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Status color mapping
const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.CONFIRMED:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.PROCESSING:
      return "bg-indigo-100 text-indigo-800";
    case OrderStatus.SHIPPED:
      return "bg-purple-100 text-purple-800";
    case OrderStatus.DELIVERED:
      return "bg-green-100 text-green-800";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    case OrderStatus.RETURNED:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case PaymentStatus.PAID:
      return "bg-green-100 text-green-800";
    case PaymentStatus.FAILED:
      return "bg-red-100 text-red-800";
    case PaymentStatus.REFUNDED:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return "Chờ xác nhận";
    case OrderStatus.CONFIRMED:
      return "Đã xác nhận";
    case OrderStatus.PROCESSING:
      return "Đang xử lý";
    case OrderStatus.SHIPPED:
      return "Đã giao";
    case OrderStatus.DELIVERED:
      return "Hoàn thành";
    case OrderStatus.CANCELLED:
      return "Đã hủy";
    case OrderStatus.RETURNED:
      return "Đã trả";
    default:
      return status;
  }
};

const getPaymentStatusText = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PENDING:
      return "Chờ thanh toán";
    case PaymentStatus.PAID:
      return "Đã thanh toán";
    case PaymentStatus.FAILED:
      return "Thanh toán thất bại";
    case PaymentStatus.REFUNDED:
      return "Đã hoàn tiền";
    default:
      return status;
  }
};

interface OrdersPageState {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

function OrdersPageContent() {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<OrdersPageState>({
    orders: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: true,
    error: null,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount">(
    "newest"
  );

  // Load orders
  const loadOrders = async (page = 1, status?: OrderStatus) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await getOrderHistoryAction(page, state.limit, status);

      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          orders: result.data!.orders,
          total: result.data!.total,
          page: result.data!.page,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || "Không thể tải danh sách đơn hàng",
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Load orders error:", error);
      setState((prev) => ({
        ...prev,
        error: "Đã xảy ra lỗi khi tải đơn hàng",
        loading: false,
      }));
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderNumber}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await cancelOrderAction(orderId, "Khách hàng yêu cầu hủy");

      if (result.success) {
        toast.success("Hủy đơn hàng thành công");
        // Reload orders
        loadOrders(state.page, statusFilter || undefined);
      } else {
        toast.error(result.error || "Không thể hủy đơn hàng");
      }
    });
  };

  // Filter orders locally
  const filteredOrders = state.orders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesSearch;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "amount":
        return b.totalAmount - a.totalAmount;
      default:
        return 0;
    }
  });

  // Effects
  useEffect(() => {
    loadOrders(1, statusFilter || undefined);
  }, [statusFilter]);

  // Pagination
  const totalPages = Math.ceil(state.total / state.limit);
  const hasNextPage = state.page < totalPages;
  const hasPrevPage = state.page > 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadOrders(newPage, statusFilter || undefined);
    }
  };

  if (state.loading && state.orders.length === 0) {
    return <OrderListSkeleton />;
  }

  if (state.error && state.orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-lg font-semibold">Không thể tải đơn hàng</h2>
              <p className="text-sm text-muted-foreground">{state.error}</p>
              <Button onClick={() => loadOrders(1)}>Thử lại</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Đơn hàng của tôi
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Theo dõi và quản lý các đơn hàng của bạn
              </p>
            </div>
            <Link href="/products">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Đặt hàng mới
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as OrderStatus | "")
                }
              >
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả trạng thái</SelectItem>
                  <SelectItem value={OrderStatus.PENDING}>
                    Chờ xác nhận
                  </SelectItem>
                  <SelectItem value={OrderStatus.CONFIRMED}>
                    Đã xác nhận
                  </SelectItem>
                  <SelectItem value={OrderStatus.PROCESSING}>
                    Đang xử lý
                  </SelectItem>
                  <SelectItem value={OrderStatus.SHIPPED}>Đã giao</SelectItem>
                  <SelectItem value={OrderStatus.DELIVERED}>
                    Hoàn thành
                  </SelectItem>
                  <SelectItem value={OrderStatus.CANCELLED}>Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="amount">Giá trị</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {sortedOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || statusFilter
                    ? "Không tìm thấy đơn hàng"
                    : "Chưa có đơn hàng nào"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter
                    ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                    : "Hãy đặt hàng đầu tiên của bạn ngay hôm nay!"}
                </p>
                <Link href="/products">
                  <Button>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Bắt đầu mua sắm
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">
                          Đơn hàng #{order.orderNumber}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getPaymentStatusColor(order.paymentStatus)}
                        >
                          {getPaymentStatusText(order.paymentStatus)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Đặt ngày{" "}
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/orders/${order.orderNumber}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Chi tiết
                        </Button>
                      </Link>
                      {(order.status === OrderStatus.PENDING ||
                        order.status === OrderStatus.CONFIRMED) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCancelOrder(order.id, order.orderNumber)
                          }
                          disabled={isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <X className="mr-2 h-4 w-4" />
                          )}
                          Hủy đơn
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <Image
                            src={
                              item.product.images?.[0] ||
                              "/placeholder-image.jpg"
                            }
                            alt={item.product.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.variant?.color} / {item.variant?.size} ×{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}

                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600 text-center">
                        và {order.items.length - 2} sản phẩm khác...
                      </p>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Truck className="mr-1 h-4 w-4" />
                        {order.shippingInfo?.method === ShippingMethod.EXPRESS
                          ? "Giao nhanh"
                          : "Giao tiêu chuẩn"}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {order.payment?.method === PaymentMethod.COD
                          ? "COD"
                          : order.payment?.method ===
                            PaymentMethod.BANK_TRANSFER
                          ? "Chuyển khoản"
                          : "Online"}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Tổng cộng</p>
                      <p className="text-lg font-semibold">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {(state.page - 1) * state.limit + 1} -{" "}
              {Math.min(state.page * state.limit, state.total)}
              trong tổng số {state.total} đơn hàng
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(state.page - 1)}
                disabled={!hasPrevPage || state.loading}
              >
                Trước
              </Button>
              <span className="px-3 py-1 text-sm">
                Trang {state.page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(state.page + 1)}
                disabled={!hasNextPage || state.loading}
              >
                Sau
              </Button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {state.loading && state.orders.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Đang tải...</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with protection and error boundary
export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrderErrorBoundary
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <h2 className="text-lg font-semibold">Lỗi tải đơn hàng</h2>
                  <p className="text-sm text-muted-foreground">
                    Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Tải lại trang
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      >
        <Suspense fallback={<OrderListLoading />}>
          <OrdersPageContent />
        </Suspense>
      </OrderErrorBoundary>
    </ProtectedRoute>
  );
}
