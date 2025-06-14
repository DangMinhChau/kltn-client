"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Eye,
  Calendar,
  Download,
} from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  recentOrders: RecentOrder[];
  monthlyRevenue: MonthlyRevenue[];
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  revenue: number;
  orders: number;
  image?: string;
}

interface TopCategory {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  products: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual admin API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockData: AnalyticsData = {
        totalRevenue: 125750000,
        totalOrders: 432,
        totalCustomers: 1284,
        totalProducts: 156,
        revenueChange: 12.5,
        ordersChange: 8.3,
        customersChange: 15.2,
        averageOrderValue: 291205,
        conversionRate: 3.4,
        topProducts: [
          {
            id: "1",
            name: "Áo Thun Basic Cotton",
            category: "Áo Thun",
            revenue: 12500000,
            orders: 85,
          },
          {
            id: "2",
            name: "Quần Jeans Slim Fit",
            category: "Quần Jeans",
            revenue: 9800000,
            orders: 67,
          },
          {
            id: "3",
            name: "Áo Polo Nam Cao Cấp",
            category: "Áo Polo",
            revenue: 8200000,
            orders: 52,
          },
        ],
        topCategories: [
          {
            id: "1",
            name: "Áo Thun",
            revenue: 35000000,
            orders: 245,
            products: 45,
          },
          {
            id: "2",
            name: "Quần Jeans",
            revenue: 28000000,
            orders: 189,
            products: 32,
          },
          {
            id: "3",
            name: "Áo Polo",
            revenue: 22000000,
            orders: 156,
            products: 28,
          },
        ],
        recentOrders: [
          {
            id: "1",
            orderNumber: "ORD-2024-001",
            customerName: "Nguyễn Văn A",
            total: 1500000,
            status: "completed",
            createdAt: "2024-06-14T10:30:00Z",
          },
          {
            id: "2",
            orderNumber: "ORD-2024-002",
            customerName: "Trần Thị B",
            total: 850000,
            status: "processing",
            createdAt: "2024-06-14T09:15:00Z",
          },
        ],
        monthlyRevenue: [
          { month: "Jan", revenue: 8500000, orders: 92 },
          { month: "Feb", revenue: 9200000, orders: 104 },
          { month: "Mar", revenue: 12100000, orders: 125 },
          { month: "Apr", revenue: 10800000, orders: 118 },
          { month: "May", revenue: 13500000, orders: 142 },
          { month: "Jun", revenue: 15200000, orders: 156 },
        ],
      };

      setData(mockData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
  };

  const ChangeIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? "text-green-600" : "text-red-600";

    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">{formatPercentage(value)}</span>
      </div>
    );
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Business insights and performance metrics
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(data.totalRevenue)}
            </div>
            <ChangeIndicator value={data.revenueChange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalOrders)}
            </div>
            <ChangeIndicator value={data.ordersChange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalCustomers)}
            </div>
            <ChangeIndicator value={data.customersChange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(data.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Conversion rate: {data.conversionRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>
                  Revenue and order count over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.monthlyRevenue.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{item.month}</div>
                        <Badge variant="outline">{item.orders} orders</Badge>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(item.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest orders and transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.customerName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatPrice(order.total)}
                        </div>
                        <Badge
                          variant={
                            order.status === "completed" ? "default" : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>
                Best selling products by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs font-medium">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{formatNumber(product.orders)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(product.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                Revenue breakdown by product category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topCategories.map((category, index) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs font-medium">
                            #{index + 1}
                          </div>
                          <div className="font-medium">{category.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category.products} products
                        </Badge>
                      </TableCell>
                      <TableCell>{formatNumber(category.orders)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(category.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Statistics</CardTitle>
              <CardDescription>
                Detailed order analytics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {formatNumber(data.totalOrders)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Orders
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {formatPrice(data.averageOrderValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Order Value
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {data.conversionRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Conversion Rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
