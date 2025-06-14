"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  FileText,
  Gift,
  Truck,
} from "lucide-react";
import Link from "next/link";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export function QuickActions() {
  const quickActions: QuickAction[] = [
    {
      title: "Thêm sản phẩm",
      description: "Thêm sản phẩm mới vào cửa hàng",
      href: "/admin/products/create",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
    },
    {
      title: "Xem đơn hàng",
      description: "Quản lý và xử lý đơn hàng",
      href: "/admin/orders",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
    },
    {
      title: "Quản lý khách hàng",
      description: "Xem thông tin khách hàng",
      href: "/admin/users",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
    },
    {
      title: "Xem đánh giá",
      description: "Kiểm tra đánh giá sản phẩm",
      href: "/admin/reviews",
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
    },
    {
      title: "Tạo voucher",
      description: "Tạo mã giảm giá mới",
      href: "/admin/vouchers/create",
      icon: Gift,
      color: "text-pink-600",
      bgColor: "bg-pink-50 hover:bg-pink-100",
    },
    {
      title: "Quản lý vận chuyển",
      description: "Theo dõi giao hàng",
      href: "/admin/shipping",
      icon: Truck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100",
    },
    {
      title: "Xem báo cáo",
      description: "Phân tích dữ liệu kinh doanh",
      href: "/admin/reports",
      icon: BarChart3,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 hover:bg-cyan-100",
    },
    {
      title: "Cài đặt",
      description: "Cấu hình hệ thống",
      href: "/admin/settings",
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-50 hover:bg-gray-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Hành động nhanh
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Các thao tác thường dùng để quản lý cửa hàng
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              variant="ghost"
              className={`h-24 flex-col space-y-2 ${action.bgColor} ${action.color} border border-transparent hover:border-current/20 transition-all duration-200`}
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs opacity-70 font-normal">
                    {action.description}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
