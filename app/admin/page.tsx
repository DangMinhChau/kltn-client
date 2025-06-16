"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Users,
  ShoppingCart,
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { InventoryStats } from "@/components/admin/InventoryStats";
import { LowStockAlert } from "@/components/admin/LowStockAlert";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  pendingReviews: number;
  activeProducts: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface RecentProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingReviews: 0,
    activeProducts: 0,
    lowStockProducts: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const [statsRes, ordersRes, productsRes] = await Promise.all([
      //   api.get('/admin/dashboard/stats'),
      //   api.get('/admin/orders?limit=5'),
      //   api.get('/admin/products?limit=5&sortBy=createdAt&sortOrder=DESC')
      // ]);

      // Mock data for now
      setStats({
        totalProducts: 150,
        totalOrders: 1250,
        totalUsers: 850,
        totalRevenue: 125000,
        pendingOrders: 23,
        pendingReviews: 12,
        activeProducts: 145,
        lowStockProducts: 8,
      });

      setRecentOrders([
        {
          id: "1",
          orderNumber: "ORD-2024-000123",
          customerName: "Nguyễn Văn A",
          total: 1200000,
          status: "pending",
          createdAt: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          orderNumber: "ORD-2024-000124",
          customerName: "Trần Thị B",
          total: 850000,
          status: "confirmed",
          createdAt: "2024-01-15T09:15:00Z",
        },
      ]);

      setRecentProducts([
        {
          id: "1",
          name: "Áo sơ mi nam công sở",
          category: "Áo sơ mi",
          price: 450000,
          stock: 25,
          status: "active",
          createdAt: "2024-01-15T08:00:00Z",
        },
        {
          id: "2",
          name: "Quần jean slim fit",
          category: "Quần jean",
          price: 650000,
          stock: 3,
          status: "active",
          createdAt: "2024-01-14T16:30:00Z",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "Hoạt động" },
      inactive: { variant: "secondary" as const, label: "Không hoạt động" },
      pending: { variant: "outline" as const, label: "Chờ xử lý" },
      confirmed: { variant: "default" as const, label: "Đã xác nhận" },
      shipping: { variant: "secondary" as const, label: "Đang giao" },
      delivered: { variant: "default" as const, label: "Đã giao" },
      cancelled: { variant: "destructive" as const, label: "Đã hủy" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      label: status,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1"></div>
                <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalOrders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +20.1% từ tháng trước
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +15.3% từ tháng trước
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockProducts} sản phẩm sắp hết hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +8.2% từ tháng trước
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đơn hàng chờ xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingOrders}
            </div>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/admin/orders?status=pending">
                <Eye className="mr-1 h-3 w-3" />
                Xem tất cả
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đánh giá chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pendingReviews}
            </div>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/admin/reviews?status=pending">
                <Eye className="mr-1 h-3 w-3" />
                Xem tất cả
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sản phẩm sắp hết</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowStockProducts}
            </div>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/admin/products?stock=low">
                <Eye className="mr-1 h-3 w-3" />
                Xem tất cả
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sản phẩm hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeProducts}
            </div>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/admin/products?status=active">
                <Eye className="mr-1 h-3 w-3" />
                Xem tất cả
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="inventory">Kho hàng</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng gần đây</CardTitle>
                <CardDescription>
                  5 đơn hàng mới nhất trong hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(order.total)}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/orders">Xem tất cả đơn hàng</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <LowStockAlert />
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryStats />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Orders Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Đơn hàng gần đây</CardTitle>
                <CardDescription>
                  Quản lý và theo dõi các đơn hàng mới nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(order.total)}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/orders">Xem tất cả đơn hàng</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Customer Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê khách hàng</CardTitle>
                <CardDescription>Tổng quan về khách hàng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tổng khách hàng
                  </span>
                  <span className="font-medium">{stats.totalUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Khách hàng mới tháng này
                  </span>
                  <span className="font-medium text-green-600">+24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Khách hàng hoạt động
                  </span>
                  <span className="font-medium">
                    {Math.floor(stats.totalUsers * 0.7)}
                  </span>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/users">Quản lý khách hàng</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Products */}
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm mới</CardTitle>
                <CardDescription>5 sản phẩm được thêm gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(product.price)}
                        </p>
                        {getStatusBadge(product.status)}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/products">
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm sản phẩm mới
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
