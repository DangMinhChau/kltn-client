"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Eye,
  Star,
  Package,
  CreditCard,
  Clock,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon: React.ReactNode;
  description?: string;
}

function StatsCard({
  title,
  value,
  change,
  changeType,
  icon,
  description,
}: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <TrendingUp
              className={`h-3 w-3 ${
                changeType === "increase" ? "text-green-500" : "text-red-500"
              }`}
            />
            <span
              className={
                changeType === "increase" ? "text-green-500" : "text-red-500"
              }
            >
              {changeType === "increase" ? "+" : ""}
              {change}%
            </span>
            <span>từ tháng trước</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats?: {
    totalUsers?: number;
    totalOrders?: number;
    totalRevenue?: number;
    totalProducts?: number;
    pageViews?: number;
    conversionRate?: number;
    averageOrderValue?: number;
    pendingOrders?: number;
  };
  trends?: {
    users?: number;
    orders?: number;
    revenue?: number;
    products?: number;
  };
}

export default function DashboardStats({ stats, trends }: DashboardStatsProps) {
  const defaultStats = {
    totalUsers: 1542,
    totalOrders: 238,
    totalRevenue: 45600000,
    totalProducts: 156,
    pageViews: 8940,
    conversionRate: 2.4,
    averageOrderValue: 1250000,
    pendingOrders: 12,
    ...stats,
  };

  const defaultTrends = {
    users: 12.5,
    orders: 8.2,
    revenue: 15.3,
    products: 4.1,
    ...trends,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const statsData = [
    {
      title: "Tổng khách hàng",
      value: defaultStats.totalUsers.toLocaleString(),
      change: defaultTrends.users,
      changeType: "increase" as const,
      icon: <Users className="h-4 w-4" />,
      description: "Khách hàng đã đăng ký",
    },
    {
      title: "Đơn hàng",
      value: defaultStats.totalOrders.toLocaleString(),
      change: defaultTrends.orders,
      changeType: "increase" as const,
      icon: <ShoppingCart className="h-4 w-4" />,
      description: "Đơn hàng trong tháng",
    },
    {
      title: "Doanh thu",
      value: formatCurrency(defaultStats.totalRevenue),
      change: defaultTrends.revenue,
      changeType: "increase" as const,
      icon: <CreditCard className="h-4 w-4" />,
      description: "Doanh thu tháng này",
    },
    {
      title: "Sản phẩm",
      value: defaultStats.totalProducts.toLocaleString(),
      change: defaultTrends.products,
      changeType: "increase" as const,
      icon: <Package className="h-4 w-4" />,
      description: "Sản phẩm đang bán",
    },
    {
      title: "Lượt xem",
      value: defaultStats.pageViews.toLocaleString(),
      change: 18.7,
      changeType: "increase" as const,
      icon: <Eye className="h-4 w-4" />,
      description: "Lượt xem trang trong tuần",
    },
    {
      title: "Tỷ lệ chuyển đổi",
      value: `${defaultStats.conversionRate}%`,
      change: 0.8,
      changeType: "increase" as const,
      icon: <TrendingUp className="h-4 w-4" />,
      description: "Tỷ lệ từ xem thành mua",
    },
    {
      title: "Giá trị đơn TB",
      value: formatCurrency(defaultStats.averageOrderValue),
      change: 5.2,
      changeType: "increase" as const,
      icon: <Star className="h-4 w-4" />,
      description: "Giá trị trung bình mỗi đơn",
    },
    {
      title: "Đơn chờ xử lý",
      value: defaultStats.pendingOrders.toLocaleString(),
      change: -12.3,
      changeType: "decrease" as const,
      icon: <Clock className="h-4 w-4" />,
      description: "Đơn hàng cần xử lý",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          Cập nhật: {new Date().toLocaleDateString("vi-VN")}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}
