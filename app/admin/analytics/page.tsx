"use client";

import { useState } from "react";
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDashboardAnalytics } from "@/lib/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [compareMode, setCompareMode] = useState(false);

  const { data: analytics, loading, refresh } = useDashboardAnalytics();

  const handleExport = () => {
    // Export analytics data to CSV/Excel
    console.log("Exporting analytics data...");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
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
            Deep insights into your store's performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={() => setCompareMode(!compareMode)}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Compare
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>{" "}
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                analytics?.revenueChart?.reduce(
                  (sum, item) => sum + item.revenue,
                  0
                ) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>{" "}
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.revenueChart
                ?.reduce((sum, item) => sum + item.orders, 0)
                ?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {" "}
            <div className="text-2xl font-bold">
              {formatCurrency(
                Math.round(
                  (analytics?.revenueChart?.reduce(
                    (sum, item) => sum + item.revenue,
                    0
                  ) || 0) /
                    (analytics?.revenueChart?.reduce(
                      (sum, item) => sum + item.orders,
                      0
                    ) || 1)
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3.8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.85%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.2%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                </CardHeader>{" "}
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics?.revenueChart || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            name === "revenue"
                              ? formatCurrency(Number(value))
                              : value,
                            name === "revenue" ? "Revenue" : "Orders",
                          ]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8884d8"
                          strokeWidth={2}
                          name="Revenue"
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          name="Orders"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sales Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Sales</span>{" "}
                      <span className="font-medium">
                        {analytics?.revenueChart
                          ?.reduce((sum, item) => sum + item.revenue, 0)
                          ?.toLocaleString()}{" "}
                        ₫
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Orders
                      </span>{" "}
                      <span className="font-medium">
                        {analytics?.revenueChart
                          ?.reduce((sum, item) => sum + item.orders, 0)
                          ?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Return Rate</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">2.3%</span>
                        <TrendingDown className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Categories</CardTitle>
                </CardHeader>{" "}
                <CardContent>
                  <div className="space-y-3">
                    {(analytics?.topProducts || [])
                      ?.slice(0, 5)
                      .map((product: any, index: number) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono text-muted-foreground">
                              #{index + 1}
                            </span>
                            <span className="text-sm">{product.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(product.revenue)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.sales} sales
                            </p>
                          </div>
                        </div>
                      )) || (
                      <p className="text-sm text-muted-foreground">
                        No data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Best Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topProducts?.slice(0, 5).map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-mono text-muted-foreground">
                          #{index + 1}
                        </span>{" "}
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Product #{product.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {product.sales} sold
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">
                      No data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Product A</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: PA001
                      </p>
                    </div>
                    <Badge variant="destructive">2 left</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Product B</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: PB002
                      </p>
                    </div>
                    <Badge variant="outline">5 left</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Product C</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: PC003
                      </p>
                    </div>
                    <Badge variant="outline">8 left</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">New Customers</span>
                    <span className="text-sm font-medium">234 (23%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Returning Customers</span>
                    <span className="text-sm font-medium">789 (77%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Customer Lifetime Value</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(2850000)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">Nguyen Van A</p>
                      <p className="text-xs text-muted-foreground">12 orders</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(5200000)}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">Tran Thi B</p>
                      <p className="text-xs text-muted-foreground">8 orders</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(3800000)}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">Le Van C</p>
                      <p className="text-xs text-muted-foreground">6 orders</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(2900000)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Ho Chi Minh City</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(12500000)} (45%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Hanoi</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(8300000)} (30%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Da Nang</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(4200000)} (15%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Other Cities</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(2800000)} (10%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Delivery Time</span>
                    <span className="text-sm font-medium">2.3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">On-time Delivery</span>
                    <span className="text-sm font-medium">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Same-day Delivery</span>
                    <span className="text-sm font-medium">23.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Website Visitors
                    </span>
                    <span className="text-sm font-bold">12,543</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Product Views</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">8,321</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        66.3%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium">Add to Cart</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">2,156</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        25.9%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Checkout</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">892</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        41.4%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium">Purchase</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">734</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        82.3%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">5.85%</p>
                    <p className="text-xs text-muted-foreground">
                      Conversion Rate
                    </p>
                    <Badge variant="outline" className="mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +0.2%
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">2.3</p>
                    <p className="text-xs text-muted-foreground">
                      Pages/Session
                    </p>
                    <Badge variant="outline" className="mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +0.1
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">2:34</p>
                    <p className="text-xs text-muted-foreground">
                      Avg. Session
                    </p>
                    <Badge variant="outline" className="mt-1">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -0:12
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">45.2%</p>
                    <p className="text-xs text-muted-foreground">Bounce Rate</p>
                    <Badge variant="outline" className="mt-1">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -2.1%
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Traffic Sources</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Direct</span>
                      <span className="font-medium">42.3%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Organic Search</span>
                      <span className="font-medium">28.7%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Social Media</span>
                      <span className="font-medium">15.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Paid Ads</span>
                      <span className="font-medium">9.1%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Email</span>
                      <span className="font-medium">4.7%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
