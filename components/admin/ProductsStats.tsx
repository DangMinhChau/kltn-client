import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ProductsStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
  };
  loading?: boolean;
}

export function ProductsStats({ stats, loading = false }: ProductsStatsProps) {
  const statItems = [
    {
      title: "Tổng sản phẩm",
      value: stats.total,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Đang hoạt động",
      value: stats.active,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Ngừng hoạt động",
      value: stats.inactive,
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "Sắp hết hàng",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${item.bgColor}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.value.toLocaleString()}
              </div>
              {item.title === "Sắp hết hàng" && item.value > 0 && (
                <p className="text-xs text-muted-foreground">
                  Cần bổ sung tồn kho
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
