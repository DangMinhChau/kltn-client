"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Gift,
  Users,
  DollarSign,
  Percent,
  Calendar,
  Target,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useAdminData } from "@/lib/hooks/useAdminData";
import { adminApi } from "@/lib/api/admin";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

interface VoucherAnalytics {
  overview: {
    totalVouchers: number;
    activeVouchers: number;
    totalUsage: number;
    totalDiscount: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  performance: {
    topVouchers: Array<{
      id: string;
      code: string;
      type: string;
      value: number;
      usage: number;
      revenue: number;
      conversionRate: number;
    }>;
    usageByType: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    usageOverTime: Array<{
      date: string;
      usage: number;
      revenue: number;
      newUsers: number;
    }>;
  };
  trends: {
    monthlyGrowth: number;
    weeklyGrowth: number;
    popularDays: Array<{
      day: string;
      usage: number;
    }>;
    seasonalTrends: Array<{
      month: string;
      usage: number;
      revenue: number;
    }>;
  };
  insights: {
    expiringVouchers: Array<{
      id: string;
      code: string;
      validTo: string;
      usage: number;
      usageLimit: number;
    }>;
    underPerforming: Array<{
      id: string;
      code: string;
      expectedUsage: number;
      actualUsage: number;
      performance: number;
    }>;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function VoucherAnalyticsPage() {
  const [analytics, setAnalytics] = useState<VoucherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = {
        period,
        ...(dateRange?.from && {
          startDate: format(dateRange.from, "yyyy-MM-dd"),
        }),
        ...(dateRange?.to && { endDate: format(dateRange.to, "yyyy-MM-dd") }),
      };

      const response = await adminApi.vouchers.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to load voucher analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      const filters = {
        period,
        ...(dateRange?.from && {
          startDate: format(dateRange.from, "yyyy-MM-dd"),
        }),
        ...(dateRange?.to && { endDate: format(dateRange.to, "yyyy-MM-dd") }),
      };

      const response = await adminApi.vouchers.export(format, filters);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `voucher-analytics-${format === "csv" ? "csv" : "xlsx"}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export analytics");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-500">
            Unable to load voucher analytics data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Voucher Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into voucher performance and usage
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <CalendarDateRangePicker
            date={dateRange}
            onDateSelect={setDateRange}
          />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("xlsx")}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vouchers
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.totalVouchers.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {analytics.overview.activeVouchers} active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.totalUsage.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analytics.trends.weeklyGrowth > 0 ? "+" : ""}
              {analytics.trends.weeklyGrowth.toFixed(1)}% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Discount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.overview.totalDiscount)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Percent className="h-3 w-3 mr-1" />
              Avg:{" "}
              {formatCurrency(
                analytics.overview.totalDiscount /
                  analytics.overview.totalUsage || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analytics.overview.conversionRate)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              AOV: {formatCurrency(analytics.overview.averageOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Usage Over Time */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.performance.usageOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "usage"
                          ? value
                          : formatCurrency(Number(value)),
                        name === "usage"
                          ? "Usage"
                          : name === "revenue"
                          ? "Revenue"
                          : "New Users",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="newUsers"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performing Vouchers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vouchers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performance.topVouchers
                    .slice(0, 5)
                    .map((voucher) => (
                      <div
                        key={voucher.id}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{voucher.code}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {voucher.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {voucher.usage} uses
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatCurrency(voucher.revenue)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercentage(voucher.conversionRate)}{" "}
                            conversion
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Usage by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.performance.usageByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {analytics.performance.usageByType.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        value,
                        props.payload.type,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {analytics.performance.usageByType.map((item, index) => (
                    <div key={item.type} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm">{item.type}</span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        {formatPercentage(item.percentage)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Seasonal Trends */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Seasonal Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends.seasonalTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="usage"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Popular Days */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Days</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.trends.popularDays}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Growth Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Growth</span>
                  <div className="flex items-center gap-1">
                    {analytics.trends.monthlyGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        analytics.trends.monthlyGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.trends.monthlyGrowth > 0 ? "+" : ""}
                      {analytics.trends.monthlyGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Weekly Growth</span>
                  <div className="flex items-center gap-1">
                    {analytics.trends.weeklyGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        analytics.trends.weeklyGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.trends.weeklyGrowth > 0 ? "+" : ""}
                      {analytics.trends.weeklyGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Expiring Vouchers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expiring Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.insights.expiringVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{voucher.code}</p>
                        <p className="text-xs text-muted-foreground">
                          Expires:{" "}
                          {format(new Date(voucher.validTo), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {voucher.usage}/{voucher.usageLimit || "∞"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {voucher.usageLimit
                            ? `${(
                                (voucher.usage / voucher.usageLimit) *
                                100
                              ).toFixed(0)}% used`
                            : "No limit"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Under-performing Vouchers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Under-performing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.insights.underPerforming.map((voucher) => (
                    <div
                      key={voucher.id}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{voucher.code}</p>
                        <p className="text-xs text-muted-foreground">
                          Expected: {voucher.expectedUsage} uses
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{voucher.actualUsage} actual</p>
                        <p className="text-xs text-red-600">
                          {formatPercentage(voucher.performance)} performance
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
