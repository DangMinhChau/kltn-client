"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Search,
  Filter,
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import Link from "next/link";

// Import enhanced types
import { Order, OrderStatus, PaymentStatus, OrderListItem } from "@/types";
import {
  OrderQueryDto,
  OrderListApiResponse,
  UpdateOrderStatusDto,
} from "@/types/api-order";
import OrderErrorBoundary, {
  withOrderErrorBoundary,
} from "@/components/common/OrderErrorBoundary";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    sortBy: "createdAt",
    sortOrder: "DESC" as "ASC" | "DESC",
    page: 1,
    limit: 20,
  });

  // Mock data for demo - replace with actual API calls
  useEffect(() => {
    fetchOrders();
  }, [filters]);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual admin API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data using proper Order type
      const mockOrders: Order[] = [
        {
          id: "1",
          orderNumber: "ORD-2024-001",
          customerName: "Nguyễn Văn A",
          customerEmail: "nguyenvana@email.com",
          customerPhone: "0123456789",
          shippingAddress: "123 Nguyễn Trãi, Phường 1, Quận 1, TP.HCM",
          status: OrderStatus.PROCESSING,
          subTotal: 1470000,
          shippingFee: 30000,
          discount: 0,
          totalPrice: 1500000,
          items: [
            {
              id: "item1",
              quantity: 2,
              unitPrice: 735000,
              productName: "Áo Polo Nam",
              variantSku: "POLO-L-NAVY",
              colorName: "Xanh Navy",
              sizeName: "L",
              orderId: "1",
              variantId: "var1",
              totalPrice: 1470000,
            },
          ],
          payment: {
            id: "pay1",
            method: "BANK_TRANSFER",
            status: "COMPLETED",
            amount: 1500000,
          },
          shipping: {
            id: "ship1",
            trackingNumber: "GHN123456",
            status: "PROCESSING",
            shippingFee: 30000,
            expectedDeliveryDate: new Date("2024-06-18T00:00:00Z"),
          },
          orderedAt: new Date("2024-06-14T10:30:00Z"),
          createdAt: new Date("2024-06-14T10:30:00Z"),
          updatedAt: new Date("2024-06-14T11:00:00Z"),
        },
        {
          id: "2",
          orderNumber: "ORD-2024-002",
          customerName: "Trần Thị B",
          customerEmail: "tranthib@email.com",
          customerPhone: "0987654321",
          shippingAddress: "456 Lê Lợi, Phường 2, Quận 3, TP.HCM",
          status: OrderStatus.PENDING,
          subTotal: 800000,
          shippingFee: 50000,
          discount: 0,
          totalPrice: 850000,
          items: [
            {
              id: "item2",
              quantity: 1,
              unitPrice: 800000,
              productName: "Quần Jean Nam",
              variantSku: "JEAN-32-BLACK",
              colorName: "Xanh Đen",
              sizeName: "32",
              orderId: "2",
              variantId: "var2",
              totalPrice: 800000,
            },
          ],
          payment: {
            id: "pay2",
            method: "COD",
            status: "PENDING",
            amount: 850000,
          },
          shipping: {
            id: "ship2",
            trackingNumber: "",
            status: "PENDING",
            shippingFee: 50000,
            expectedDeliveryDate: new Date("2024-06-16T00:00:00Z"),
          },
          orderedAt: new Date("2024-06-14T09:15:00Z"),
          createdAt: new Date("2024-06-14T09:15:00Z"),
          updatedAt: new Date("2024-06-14T09:15:00Z"),
        },
        {
          id: "3",
          orderNumber: "ORD-2024-003",
          customerName: "Lê Văn C",
          customerEmail: "levanc@email.com",
          customerPhone: "0369852147",
          shippingAddress: "789 Trần Hưng Đạo, Phường 5, Quận 5, TP.HCM",
          status: OrderStatus.DELIVERED,
          subTotal: 2170000,
          shippingFee: 30000,
          discount: 0,
          totalPrice: 2200000,
          items: [
            {
              id: "item3",
              quantity: 3,
              unitPrice: 723333,
              productName: "Áo Sơ Mi Nam",
              variantSku: "SHIRT-XL-WHITE",
              colorName: "Trắng",
              sizeName: "XL",
              orderId: "3",
              variantId: "var3",
              totalPrice: 2170000,
            },
          ],
          payment: {
            id: "pay3",
            method: "VNPAY",
            status: "COMPLETED",
            amount: 2200000,
          },
          shipping: {
            id: "ship3",
            trackingNumber: "GHN789012",
            status: "DELIVERED",
            shippingFee: 30000,
            expectedDeliveryDate: new Date("2024-06-17T00:00:00Z"),
          },
          orderedAt: new Date("2024-06-13T14:20:00Z"),
          createdAt: new Date("2024-06-13T14:20:00Z"),
          updatedAt: new Date("2024-06-14T08:45:00Z"),
        },
      ];

      setOrders(mockOrders);
      setPagination({
        page: 1,
        limit: 20,
        total: mockOrders.length,
        totalPages: 1,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : Number(value),
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const statusConfig: Record<
      OrderStatus,
      {
        label: string;
        variant: "secondary" | "default" | "outline" | "destructive";
        icon: any;
      }
    > = {
      [OrderStatus.PENDING]: {
        label: "Pending",
        variant: "secondary",
        icon: Clock,
      },
      [OrderStatus.CONFIRMED]: {
        label: "Confirmed",
        variant: "default",
        icon: CheckCircle,
      },
      [OrderStatus.PROCESSING]: {
        label: "Processing",
        variant: "default",
        icon: Package,
      },
      [OrderStatus.SHIPPED]: {
        label: "Shipped",
        variant: "outline",
        icon: Package,
      },
      [OrderStatus.DELIVERED]: {
        label: "Delivered",
        variant: "default",
        icon: CheckCircle,
      },
      [OrderStatus.COMPLETED]: {
        label: "Completed",
        variant: "default",
        icon: CheckCircle,
      },
      [OrderStatus.CANCELLED]: {
        label: "Cancelled",
        variant: "destructive",
        icon: XCircle,
      },
      [OrderStatus.RETURNED]: {
        label: "Returned",
        variant: "outline",
        icon: XCircle,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const PaymentStatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: "secondary" | "default" | "outline" | "destructive";
      }
    > = {
      PENDING: { label: "Pending", variant: "secondary" },
      COMPLETED: { label: "Paid", variant: "default" },
      FAILED: { label: "Failed", variant: "destructive" },
      REFUNDED: { label: "Refunded", variant: "outline" },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "secondary" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and fulfillment
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "processing").length}
            </div>
            <p className="text-xs text-muted-foreground">Being prepared</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "delivered").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentStatus}
              onValueChange={(value) =>
                handleFilterChange("paymentStatus", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All payment status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split("-");
                setFilters((prev) => ({
                  ...prev,
                  sortBy,
                  sortOrder: sortOrder as "ASC" | "DESC",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-DESC">Newest first</SelectItem>
                <SelectItem value="createdAt-ASC">Oldest first</SelectItem>
                <SelectItem value="total-DESC">Amount: High to Low</SelectItem>
                <SelectItem value="total-ASC">Amount: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {order.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customerEmail}
                        </div>
                      </div>
                    </TableCell>{" "}
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge
                        status={order.payment?.status || "PENDING"}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.items.length} items
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(order.totalPrice)}
                    </TableCell>
                    <TableCell>
                      {formatDate(order.createdAt.toISOString())}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main component wrapped with error boundary
export default function OrdersPage() {
  return (
    <OrderErrorBoundary
      showRetry={true}
      showGoBack={true}
      onError={(error, errorInfo) => {
        console.error("Orders page error:", error, errorInfo);
      }}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <AdminOrdersContent />
      </Suspense>
    </OrderErrorBoundary>
  );
}
