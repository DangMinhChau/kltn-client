"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Heart,
  Star,
  MessageSquare,
  Truck,
  Gift,
  Bell,
  Settings,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color?: "default" | "green" | "red" | "blue" | "yellow" | "purple" | "orange";
  trend?: "up" | "down";
  loading?: boolean;
  description?: string;
}

const iconMap = {
  package: Package,
  check: CheckCircle,
  alertTriangle: AlertTriangle,
  alertCircle: AlertCircle,
  dollarSign: DollarSign,
  shoppingCart: ShoppingCart,
  users: Users,
  eye: Eye,
  heart: Heart,
  star: Star,
  messageSquare: MessageSquare,
  truck: Truck,
  gift: Gift,
  bell: Bell,
  settings: Settings,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
};

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = "default",
  trend,
  loading = false,
  description,
}: StatsCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Package;

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
      case "purple":
        return "border-l-4 border-l-purple-500";
      case "orange":
        return "border-l-4 border-l-orange-500";
      default:
        return "";
    }
  };

  const getIconBackground = () => {
    switch (color) {
      case "green":
        return "bg-green-50 text-green-600";
      case "red":
        return "bg-red-50 text-red-600";
      case "blue":
        return "bg-blue-50 text-blue-600";
      case "yellow":
        return "bg-yellow-50 text-yellow-600";
      case "purple":
        return "bg-purple-50 text-purple-600";
      case "orange":
        return "bg-orange-50 text-orange-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  if (loading) {
    return (
      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="w-24 h-4 bg-gray-200 animate-pulse rounded" />
          <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="w-16 h-8 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="w-32 h-4 bg-gray-200 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all hover:shadow-lg ${getCardBorder()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${getIconBackground()}`}>
          <IconComponent className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>

        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}

        {(change !== undefined || changeLabel) && (
          <div className="flex items-center mt-2 space-x-2">
            {change !== undefined && (
              <div className={`flex items-center ${getTrendColor()}`}>
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                <span className="text-xs font-medium">{Math.abs(change)}%</span>
              </div>
            )}
            {changeLabel && (
              <span className="text-xs text-muted-foreground">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
