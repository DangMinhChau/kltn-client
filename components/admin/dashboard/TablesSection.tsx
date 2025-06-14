"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Eye,
  ShoppingCart,
  Package,
  Users,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
  category?: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  createdAt?: string;
  avatar?: string;
}

interface TablesSectionProps {
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  formatCurrency: (amount: number) => string;
}

export function TablesSection({
  topProducts,
  recentOrders,
  formatCurrency,
}: TablesSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipping":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getRankIcon = (index: number) => {
    const colors = [
      "text-yellow-500", // Gold
      "text-gray-400", // Silver
      "text-amber-600", // Bronze
      "text-blue-500", // Blue
      "text-green-500", // Green
    ];
    return colors[index] || "text-gray-500";
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Sản phẩm bán chạy
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Top 5 sản phẩm có doanh số cao nhất
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              Xem tất cả
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center space-x-4 p-3 rounded-lg border bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-200"
              >
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index < 3
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    #{index + 1}
                  </div>
                  {index === 0 && (
                    <Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-current" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">
                      {product.sales} đã bán
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                  {product.category && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getRankIcon(index)}>
                    <Star className="mr-1 h-3 w-3" />
                    Top {index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Đơn hàng gần đây
            </CardTitle>
            <p className="text-sm text-muted-foreground">5 đơn hàng mới nhất</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              Xem tất cả
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={order.avatar} />
                    <AvatarFallback className="text-xs">
                      {order.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.customer}</p>
                    {order.createdAt && (
                      <div className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(order.total)}
                  </p>
                  <Badge
                    className={`${getStatusColor(order.status)} text-xs mt-1`}
                  >
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
