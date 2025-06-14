"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: "up" | "down";
  color?: "default" | "green" | "red" | "blue" | "yellow";
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  color = "default",
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    return "text-red-600";
  };

  const getCardBorder = () => {
    switch (color) {
      case "green":
        return "border-l-4 border-l-green-500";
      case "red":
        return "border-l-4 border-l-red-500";
      case "blue":
        return "border-l-4 border-l-blue-500";
      case "yellow":
        return "border-l-4 border-l-yellow-500";
      default:
        return "";
    }
  };

  return (
    <Card className={`transition-all hover:shadow-lg ${getCardBorder()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        <div className="flex items-center mt-2 space-x-2">
          <div className={`flex items-center ${getTrendColor()}`}>
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            <span className="text-xs font-medium">{Math.abs(change)}%</span>
          </div>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: {
    revenue: {
      total: number;
      growth: number;
      thisMonth: number;
      lastMonth: number;
    };
    orders: {
      total: number;
      growth: number;
      pending: number;
      completed: number;
      cancelled: number;
    };
    customers: {
      total: number;
      growth: number;
      active: number;
      new: number;
    };
    products: {
      total: number;
      active: number;
      outOfStock: number;
      lowStock: number;
    };
  };
  formatCurrency: (amount: number) => string;
}

export function StatsCards({ stats, formatCurrency }: StatsCardsProps) {
  const cards = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(stats.revenue.total),
      change: stats.revenue.growth,
      changeLabel: "so với tháng trước",
      icon: DollarSign,
      trend: stats.revenue.growth > 0 ? ("up" as const) : ("down" as const),
      color: "green" as const,
    },
    {
      title: "Đơn hàng",
      value: stats.orders.total.toLocaleString(),
      change: stats.orders.growth,
      changeLabel: "so với tháng trước",
      icon: ShoppingCart,
      trend: stats.orders.growth > 0 ? ("up" as const) : ("down" as const),
      color: "blue" as const,
    },
    {
      title: "Khách hàng",
      value: stats.customers.total.toLocaleString(),
      change: stats.customers.growth,
      changeLabel: "so với tháng trước",
      icon: Users,
      trend: stats.customers.growth > 0 ? ("up" as const) : ("down" as const),
      color: "yellow" as const,
    },
    {
      title: "Sản phẩm",
      value: stats.products.total,
      change: 0,
      changeLabel: `${stats.products.active} đang hoạt động`,
      icon: Package,
      trend: "up" as const,
      color: "default" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
}
