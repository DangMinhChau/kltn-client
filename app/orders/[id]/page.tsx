"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { orderApi } from "@/lib/api/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  CalendarDays,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  User,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types (same as OrderHistory but more detailed)
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
    images?: Array<{
      url: string;
    }>;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount?: number;
  totalPrice?: number; // Backend might use this field name
  subTotal?: number;
  shippingFee?: number;
  discount?: number;
  createdAt: string;
  completedAt?: string;
  canceledAt?: string;
  note?: string;
  items: OrderItem[];
  payment?: {
    method: string;
    status: string;
    paidAt?: string;
  };
  shipping?: {
    method: string;
    status: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    address?: {
      fullName: string;
      phone: string;
      email?: string;
      address: string;
      ward: string;
      district: string;
      province: string;
    };
  };
  user?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// Order status mapping
const orderStatusMap = {
  PENDING: {
    label: "Chờ xử lý",
    variant: "secondary" as const,
    color: "bg-yellow-100 text-yellow-800",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    variant: "default" as const,
    color: "bg-blue-100 text-blue-800",
  },
  PREPARING: {
    label: "Đang chuẩn bị",
    variant: "default" as const,
    color: "bg-orange-100 text-orange-800",
  },
  SHIPPING: {
    label: "Đang giao",
    variant: "default" as const,
    color: "bg-purple-100 text-purple-800",
  },
  COMPLETED: {
    label: "Hoàn thành",
    variant: "default" as const,
    color: "bg-green-100 text-green-800",
  },
  CANCELLED: {
    label: "Đã hủy",
    variant: "destructive" as const,
    color: "bg-red-100 text-red-800",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    variant: "secondary" as const,
    color: "bg-gray-100 text-gray-800",
  },
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  // Load order details
  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const orderData = await orderApi.getOrder(id);
      setOrder(orderData);
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin đơn hàng");
      toast.error("Lỗi tải dữ liệu", {
        description: err.message || "Không thể tải thông tin đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);
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

  // Copy order number to clipboard
  const copyOrderNumber = async () => {
    if (!order) return;

    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopiedOrderNumber(true);
      toast.success("Đã sao chép mã đơn hàng");
      setTimeout(() => setCopiedOrderNumber(false), 2000);
    } catch (err) {
      toast.error("Không thể sao chép mã đơn hàng");
    }
  };

  // Get order status
  const getOrderStatus = (status: string) => {
    return (
      orderStatusMap[status as keyof typeof orderStatusMap] || {
        label: status,
        variant: "secondary" as const,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-16 w-16" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error || "Không tìm thấy đơn hàng"}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadOrder}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusInfo = getOrderStatus(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">
                  #{order.orderNumber}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyOrderNumber}
                  className="h-6 w-6 p-0"
                >
                  {copiedOrderNumber ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div
              className={cn(
                "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                statusInfo.color
              )}
            >
              {statusInfo.label}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Sản phẩm đã đặt ({order.items.length} sản phẩm)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.variant.images?.[0] ? (
                        <Image
                          src={item.variant.images[0].url}
                          alt={item.variant.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {item.variant.product.name}
                      </h4>
                      {(item.variant.color || item.variant.size) && (
                        <p className="text-sm text-muted-foreground">
                          {[item.variant.color?.name, item.variant.size?.name]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.variant.sku}
                      </p>
                    </div>{" "}
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(item.unitPrice || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Số lượng: {item.quantity || 0}
                      </div>
                      <div className="text-sm font-medium">
                        ={" "}
                        {formatCurrency(
                          (item.unitPrice || 0) * (item.quantity || 0)
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shipping?.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {order.shipping.address.fullName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.shipping.address.phone}</span>
                    </div>
                    {order.shipping.address.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{order.shipping.address.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div>{order.shipping.address.address}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.shipping.address.ward},{" "}
                          {order.shipping.address.district},{" "}
                          {order.shipping.address.province}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Note */}
            {order.note && (
              <Card>
                <CardHeader>
                  <CardTitle>Ghi chú đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.note}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {" "}
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(order.subTotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(order.shippingFee || 0)}</span>
                </div>
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">
                    {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            {order.payment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Phương thức:</span>
                    <span className="font-medium">{order.payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái:</span>
                    <Badge
                      variant={
                        order.payment.status === "PAID"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {order.payment.status === "PAID"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </Badge>
                  </div>
                  {order.payment.paidAt && (
                    <div className="flex justify-between">
                      <span>Thời gian:</span>
                      <span className="text-sm">
                        {format(
                          new Date(order.payment.paidAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Shipping Info */}
            {order.shipping && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Vận chuyển
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Phương thức:</span>
                    <span className="font-medium">{order.shipping.method}</span>
                  </div>
                  {order.shipping.trackingNumber && (
                    <div className="flex justify-between">
                      <span>Mã vận đơn:</span>
                      <span className="font-mono text-sm">
                        {order.shipping.trackingNumber}
                      </span>
                    </div>
                  )}
                  {order.shipping.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span>Dự kiến giao:</span>
                      <span className="text-sm">
                        {format(
                          new Date(order.shipping.estimatedDelivery),
                          "dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Lịch sử đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Đơn hàng được tạo</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </div>
                  </div>
                </div>

                {order.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        Đơn hàng hoàn thành
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(
                          new Date(order.completedAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {order.canceledAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Đơn hàng bị hủy</div>
                      <div className="text-xs text-muted-foreground">
                        {format(
                          new Date(order.canceledAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
